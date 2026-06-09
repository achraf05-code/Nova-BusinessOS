"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow, newId } from "@/lib/demoStore";
import { withAction, actionOk, actionFail } from "@/lib/actions";
import {
  contactSchema,
  dealSchema,
  flatFieldErrors,
} from "@/lib/validation";
import { logActivity, notify } from "@/lib/activity";
import { checkUsage } from "@/lib/usage";
import type { CrmContact, CrmDeal, LeadStage } from "@/types/database";

const PATHS = ["/dashboard/crm", "/dashboard"];

/* -------------------- Contacts -------------------------------------- */

export async function createContactAction(form: Record<string, unknown>) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const usage = await checkUsage(ctx.company.id, "contact");
    if (!usage.ok) return actionFail(usage.error);
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid contact data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const row = {
      company_id: ctx.company.id,
      full_name: v.full_name,
      email: v.email || null,
      phone: v.phone || null,
      company_name: v.company_name || null,
      title: v.title || null,
      notes: v.notes || null,
      owner_id: ctx.user.id,
    };

    let contact: CrmContact;
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("crm_contacts")
        .insert(row as never)
        .select("*")
        .single();
      if (error || !data) return actionFail(error?.message ?? "Insert failed");
      contact = data as CrmContact;
    } else {
      contact = {
        id: newId(),
        ...row,
        created_at: isoNow(),
        updated_at: isoNow(),
        source: null,
      } as CrmContact;
      getStore().contacts.unshift(contact);
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "contact.created",
      entityType: "crm_contact",
      entityId: contact.id,
      metadata: { full_name: contact.full_name },
    });
    return actionOk(contact);
  });
}

export async function updateContactAction(
  id: string,
  form: Record<string, unknown>
) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid contact data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const patch = {
      full_name: v.full_name,
      email: v.email || null,
      phone: v.phone || null,
      company_name: v.company_name || null,
      title: v.title || null,
      notes: v.notes || null,
    };

    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("crm_contacts")
        .update(patch as never)
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const existing = store.contacts.find(
        (c) => c.id === id && c.company_id === ctx.company.id
      );
      if (!existing) return actionFail("Contact not found");
      Object.assign(existing, patch, { updated_at: isoNow() });
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "contact.updated",
      entityType: "crm_contact",
      entityId: id,
      metadata: { full_name: v.full_name },
    });
    return actionOk({ id });
  });
}

export async function deleteContactAction(id: string) {
  return withAction({ revalidate: PATHS, requiredRole: "manager" }, async (ctx) => {
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("crm_contacts")
        .delete()
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const before = store.contacts.length;
      store.contacts = store.contacts.filter(
        (c) => !(c.id === id && c.company_id === ctx.company.id)
      );
      if (store.contacts.length === before) return actionFail("Contact not found");
    }
    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "contact.deleted",
      entityType: "crm_contact",
      entityId: id,
    });
    return actionOk({ id });
  });
}

/* -------------------- Deals ----------------------------------------- */

export async function createDealAction(form: Record<string, unknown>) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const parsed = dealSchema.safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid deal data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const row = {
      company_id: ctx.company.id,
      title: v.title,
      contact_id: v.contact_id || null,
      value: v.value,
      currency: ctx.company.currency,
      stage: v.stage,
      probability: v.probability,
      expected_close: v.expected_close || null,
      owner_id: ctx.user.id,
    };

    let deal: CrmDeal;
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("crm_deals")
        .insert(row as never)
        .select("*")
        .single();
      if (error || !data) return actionFail(error?.message ?? "Insert failed");
      deal = data as CrmDeal;
    } else {
      deal = {
        id: newId(),
        ...row,
        created_at: isoNow(),
        updated_at: isoNow(),
      } as CrmDeal;
      getStore().deals.unshift(deal);
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "deal.created",
      entityType: "crm_deal",
      entityId: deal.id,
      metadata: { title: deal.title, value: deal.value },
    });
    if (deal.stage === "won") {
      await notify({
        companyId: ctx.company.id,
        userId: ctx.user.id,
        type: "lead_won",
        title: `Lead won — ${deal.title}`,
        body: `+${formatMoney(deal.value, deal.currency)}`,
        href: "/dashboard/crm",
      });
    }
    return actionOk(deal);
  });
}

export async function updateDealAction(
  id: string,
  form: Record<string, unknown>
) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const parsed = dealSchema.partial().safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid deal data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const patch: Record<string, unknown> = {};
    if (v.title !== undefined) patch.title = v.title;
    if (v.contact_id !== undefined) patch.contact_id = v.contact_id || null;
    if (v.value !== undefined) patch.value = v.value;
    if (v.probability !== undefined) patch.probability = v.probability;
    if (v.stage !== undefined) patch.stage = v.stage;
    if (v.expected_close !== undefined)
      patch.expected_close = v.expected_close || null;

    let prevStage: LeadStage | null = null;
    let updated: CrmDeal | null = null;

    if (supabaseConfigured) {
      const supabase = await createClient();
      const { data: existing } = await supabase
        .from("crm_deals")
        .select("*")
        .eq("id", id)
        .eq("company_id", ctx.company.id)
        .maybeSingle();
      if (!existing) return actionFail("Deal not found");
      prevStage = (existing as CrmDeal).stage;
      const { data, error } = await supabase
        .from("crm_deals")
        .update(patch as never)
        .eq("id", id)
        .eq("company_id", ctx.company.id)
        .select("*")
        .single();
      if (error || !data) return actionFail(error?.message ?? "Update failed");
      updated = data as CrmDeal;
    } else {
      const store = getStore();
      const existing = store.deals.find(
        (d) => d.id === id && d.company_id === ctx.company.id
      );
      if (!existing) return actionFail("Deal not found");
      prevStage = existing.stage;
      Object.assign(existing, patch, { updated_at: isoNow() });
      updated = existing;
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "deal.updated",
      entityType: "crm_deal",
      entityId: id,
      metadata: { stage: updated!.stage, prev_stage: prevStage },
    });
    if (updated!.stage === "won" && prevStage !== "won") {
      await notify({
        companyId: ctx.company.id,
        userId: ctx.user.id,
        type: "lead_won",
        title: `Lead won — ${updated!.title}`,
        body: `+${formatMoney(updated!.value, updated!.currency)}`,
        href: "/dashboard/crm",
      });
    }
    return actionOk(updated!);
  });
}

export async function moveDealStageAction(id: string, stage: LeadStage) {
  return updateDealAction(id, { stage });
}

export async function deleteDealAction(id: string) {
  return withAction({ revalidate: PATHS, requiredRole: "manager" }, async (ctx) => {
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("crm_deals")
        .delete()
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const before = store.deals.length;
      store.deals = store.deals.filter(
        (d) => !(d.id === id && d.company_id === ctx.company.id)
      );
      if (store.deals.length === before) return actionFail("Deal not found");
    }
    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "deal.deleted",
      entityType: "crm_deal",
      entityId: id,
    });
    return actionOk({ id });
  });
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
