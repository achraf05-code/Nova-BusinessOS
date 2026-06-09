"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow, newId } from "@/lib/demoStore";
import { withAction, actionOk, actionFail } from "@/lib/actions";
import {
  flatFieldErrors,
  invoiceSchema,
} from "@/lib/validation";
import { logActivity, notify } from "@/lib/activity";
import { sendEmail } from "@/lib/email";
import { invoicePaidEmail, invoiceSentEmail } from "@/lib/email/templates";
import { nova } from "@/config/nova";
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/types/database";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? nova.url;

const PATHS = [
  "/dashboard/invoices",
  "/dashboard/accounting",
  "/dashboard",
];

function totalsFromItems(
  items: { quantity: number; unit_price: number }[],
  taxRate = 0
) {
  const subtotal = items.reduce(
    (s, i) => s + Number(i.quantity) * Number(i.unit_price),
    0
  );
  const tax_amount = +(subtotal * (Number(taxRate) / 100)).toFixed(2);
  const total = +(subtotal + tax_amount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), tax_amount, total };
}

export async function createInvoiceAction(form: Record<string, unknown>) {
  return withAction(
    { revalidate: PATHS, requiredRole: "manager" },
    async (ctx) => {
      const parsed = invoiceSchema.safeParse(form);
      if (!parsed.success) {
        return actionFail(
          "Invalid invoice data",
          flatFieldErrors(parsed.error)
        );
      }
      const v = parsed.data;
      const totals = totalsFromItems(v.items, v.tax_rate ?? 0);
      const invoiceRow = {
        company_id: ctx.company.id,
        number: v.number,
        contact_id: v.contact_id || null,
        status: v.status,
        issue_date: v.issue_date,
        due_date: v.due_date || null,
        subtotal: totals.subtotal,
        tax_rate: v.tax_rate ?? 0,
        tax_amount: totals.tax_amount,
        total: totals.total,
        currency: ctx.company.currency,
        notes: v.client_label || v.notes || null,
        created_by: ctx.user.id,
      };

      let invoice: Invoice;
      let items: InvoiceItem[];
      if (supabaseConfigured) {
        const supabase = await createClient();
        const { data: invIns, error: invErr } = await supabase
          .from("invoices")
          .insert(invoiceRow as never)
          .select("*")
          .single();
        if (invErr || !invIns) {
          return actionFail(invErr?.message ?? "Insert failed");
        }
        invoice = invIns as Invoice;
        const itemsRows = v.items.map((it, idx) => ({
          invoice_id: invoice.id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: +(it.quantity * it.unit_price).toFixed(2),
          position: idx,
        }));
        const { data: itIns, error: itErr } = await supabase
          .from("invoice_items")
          .insert(itemsRows as never)
          .select("*");
        if (itErr) return actionFail(itErr.message);
        items = (itIns ?? []) as InvoiceItem[];
      } else {
        invoice = {
          id: newId(),
          ...invoiceRow,
          created_at: isoNow(),
          updated_at: isoNow(),
        } as Invoice;
        items = v.items.map((it, idx) => ({
          id: newId(),
          invoice_id: invoice.id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: +(it.quantity * it.unit_price).toFixed(2),
          position: idx,
        }));
        const store = getStore();
        store.invoices.unshift(invoice);
        store.invoiceItems.push(...items);
      }

      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "invoice.created",
        entityType: "invoice",
        entityId: invoice.id,
        metadata: { number: invoice.number, total: invoice.total },
      });
      await notify({
        companyId: ctx.company.id,
        userId: ctx.user.id,
        type: "system",
        title: `Invoice ${invoice.number} created`,
        body: `${ctx.company.currency} ${invoice.total.toFixed(2)}`,
        href: "/dashboard/invoices",
      });
      return actionOk({ invoice, items });
    }
  );
}

export async function updateInvoiceAction(
  id: string,
  form: Record<string, unknown>
) {
  return withAction(
    { revalidate: PATHS, requiredRole: "manager" },
    async (ctx) => {
      const parsed = invoiceSchema.safeParse(form);
      if (!parsed.success) {
        return actionFail(
          "Invalid invoice data",
          flatFieldErrors(parsed.error)
        );
      }
      const v = parsed.data;
      const totals = totalsFromItems(v.items, v.tax_rate ?? 0);
      const patch = {
        number: v.number,
        contact_id: v.contact_id || null,
        status: v.status,
        issue_date: v.issue_date,
        due_date: v.due_date || null,
        subtotal: totals.subtotal,
        tax_rate: v.tax_rate ?? 0,
        tax_amount: totals.tax_amount,
        total: totals.total,
        notes: v.client_label || v.notes || null,
      };

      let prevStatus: InvoiceStatus | null = null;
      if (supabaseConfigured) {
        const supabase = await createClient();
        const { data: existing } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .eq("company_id", ctx.company.id)
          .maybeSingle();
        if (!existing) return actionFail("Invoice not found");
        prevStatus = (existing as Invoice).status;

        const { error: invErr } = await supabase
          .from("invoices")
          .update(patch as never)
          .eq("id", id)
          .eq("company_id", ctx.company.id);
        if (invErr) return actionFail(invErr.message);

        // Replace line items: delete + re-insert (simple, deterministic)
        const { error: delErr } = await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", id);
        if (delErr) return actionFail(delErr.message);
        const itemsRows = v.items.map((it, idx) => ({
          invoice_id: id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: +(it.quantity * it.unit_price).toFixed(2),
          position: idx,
        }));
        const { error: insErr } = await supabase
          .from("invoice_items")
          .insert(itemsRows as never);
        if (insErr) return actionFail(insErr.message);
      } else {
        const store = getStore();
        const existing = store.invoices.find(
          (i) => i.id === id && i.company_id === ctx.company.id
        );
        if (!existing) return actionFail("Invoice not found");
        prevStatus = existing.status;
        Object.assign(existing, patch, { updated_at: isoNow() });
        store.invoiceItems = store.invoiceItems.filter(
          (it) => it.invoice_id !== id
        );
        store.invoiceItems.push(
          ...v.items.map((it, idx) => ({
            id: newId(),
            invoice_id: id,
            description: it.description,
            quantity: it.quantity,
            unit_price: it.unit_price,
            amount: +(it.quantity * it.unit_price).toFixed(2),
            position: idx,
          }))
        );
      }

      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "invoice.updated",
        entityType: "invoice",
        entityId: id,
        metadata: { number: v.number, status: v.status, total: totals.total },
      });
      if (v.status === "paid" && prevStatus !== "paid") {
        await notify({
          companyId: ctx.company.id,
          userId: ctx.user.id,
          type: "invoice_paid",
          title: `Invoice ${v.number} marked paid`,
          body: `${ctx.company.currency} ${totals.total.toFixed(2)}`,
          href: "/dashboard/invoices",
        });
        await maybeEmailInvoicePaid({
          ctx,
          invoiceNumber: v.number,
          total: totals.total,
          contactEmail: await resolveContactEmail(v.contact_id ?? null, ctx.company.id),
        });
      }
      if (v.status === "sent" && prevStatus !== "sent") {
        await maybeEmailInvoiceSent({
          ctx,
          invoiceNumber: v.number,
          total: totals.total,
          dueDate: v.due_date || null,
          contactEmail: await resolveContactEmail(v.contact_id ?? null, ctx.company.id),
        });
      }
      return actionOk({ id });
    }
  );
}

export async function setInvoiceStatusAction(id: string, status: InvoiceStatus) {
  return withAction(
    { revalidate: PATHS, requiredRole: "manager" },
    async (ctx) => {
      let prev: InvoiceStatus | null = null;
      let invoiceNumber = "";
      let total = 0;
      let contactId: string | null = null;
      let dueDate: string | null = null;

      if (supabaseConfigured) {
        const supabase = await createClient();
        const { data: existing } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .eq("company_id", ctx.company.id)
          .maybeSingle();
        if (!existing) return actionFail("Invoice not found");
        prev = (existing as Invoice).status;
        invoiceNumber = (existing as Invoice).number;
        total = (existing as Invoice).total;
        contactId = (existing as Invoice).contact_id;
        dueDate = (existing as Invoice).due_date;
        const { error } = await supabase
          .from("invoices")
          .update({ status } as never)
          .eq("id", id)
          .eq("company_id", ctx.company.id);
        if (error) return actionFail(error.message);
      } else {
        const store = getStore();
        const existing = store.invoices.find(
          (i) => i.id === id && i.company_id === ctx.company.id
        );
        if (!existing) return actionFail("Invoice not found");
        prev = existing.status;
        invoiceNumber = existing.number;
        total = existing.total;
        contactId = existing.contact_id;
        dueDate = existing.due_date;
        existing.status = status;
        existing.updated_at = isoNow();
      }

      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "invoice.status_changed",
        entityType: "invoice",
        entityId: id,
        metadata: { from: prev, to: status },
      });
      if (status === "paid" && prev !== "paid") {
        await notify({
          companyId: ctx.company.id,
          userId: ctx.user.id,
          type: "invoice_paid",
          title: `Invoice ${invoiceNumber} marked paid`,
          body: `${ctx.company.currency} ${total.toFixed(2)}`,
          href: "/dashboard/invoices",
        });
        await maybeEmailInvoicePaid({
          ctx,
          invoiceNumber,
          total,
          contactEmail: await resolveContactEmail(contactId, ctx.company.id),
        });
      }
      if (status === "sent" && prev !== "sent") {
        await maybeEmailInvoiceSent({
          ctx,
          invoiceNumber,
          total,
          dueDate: dueDate,
          contactEmail: await resolveContactEmail(contactId, ctx.company.id),
        });
      }
      return actionOk({ id, status });
    }
  );
}

export async function deleteInvoiceAction(id: string) {
  return withAction(
    { revalidate: PATHS, requiredRole: "admin" },
    async (ctx) => {
      if (supabaseConfigured) {
        const supabase = await createClient();
        const { error } = await supabase
          .from("invoices")
          .delete()
          .eq("id", id)
          .eq("company_id", ctx.company.id);
        if (error) return actionFail(error.message);
      } else {
        const store = getStore();
        const before = store.invoices.length;
        store.invoices = store.invoices.filter(
          (i) => !(i.id === id && i.company_id === ctx.company.id)
        );
        store.invoiceItems = store.invoiceItems.filter(
          (it) => it.invoice_id !== id
        );
        if (store.invoices.length === before) return actionFail("Invoice not found");
      }
      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "invoice.deleted",
        entityType: "invoice",
        entityId: id,
      });
      return actionOk({ id });
    }
  );
}


/* ----------------------- email helpers ----------------------- */

async function resolveContactEmail(
  contactId: string | null,
  companyId: string
): Promise<string | null> {
  if (!contactId) return null;
  if (!supabaseConfigured) {
    const c = getStore().contacts.find(
      (x) => x.id === contactId && x.company_id === companyId
    );
    return c?.email ?? null;
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("crm_contacts")
      .select("email")
      .eq("id", contactId)
      .eq("company_id", companyId)
      .maybeSingle();
    return (data as { email: string | null } | null)?.email ?? null;
  } catch {
    return null;
  }
}

async function maybeEmailInvoiceSent(args: {
  ctx: { company: { name: string; currency: string }; user: { email: string | null } };
  invoiceNumber: string;
  total: number;
  dueDate: string | null;
  contactEmail: string | null;
}) {
  if (!args.contactEmail) return;
  const tpl = invoiceSentEmail({
    invoiceNumber: args.invoiceNumber,
    total: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: args.ctx.company.currency,
    }).format(args.total),
    dueDate: args.dueDate,
    companyName: args.ctx.company.name,
    invoiceUrl: `${APP_URL}/dashboard/invoices`,
  });
  await sendEmail({
    to: args.contactEmail,
    subject: tpl.subject,
    html: tpl.html,
    template: "invoice_sent",
  });
}

async function maybeEmailInvoicePaid(args: {
  ctx: { company: { name: string; currency: string }; user: { email: string | null } };
  invoiceNumber: string;
  total: number;
  contactEmail: string | null;
}) {
  if (!args.contactEmail) return;
  const tpl = invoicePaidEmail({
    invoiceNumber: args.invoiceNumber,
    total: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: args.ctx.company.currency,
    }).format(args.total),
    companyName: args.ctx.company.name,
  });
  await sendEmail({
    to: args.contactEmail,
    subject: tpl.subject,
    html: tpl.html,
    template: "invoice_paid",
  });
}
