/**
 * Plan-aware usage limits. Every Sprint 1 create action calls
 * `checkUsage(ctx, "contact" | "project" | ...)` before writing. The helper
 * resolves the active company's plan, counts the relevant resource and
 * returns either `{ ok: true }` or `{ ok: false, error, limit }` so the
 * action can surface a friendly upgrade prompt without leaking internals.
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore } from "@/lib/demoStore";
import { PLAN_LIMITS, isUnlimited } from "@/lib/plans";
import type { Subscription, SubscriptionPlan } from "@/types/database";

export type UsageResource = "contact" | "project" | "user";

export interface UsageOk {
  ok: true;
  plan: SubscriptionPlan;
  used: number;
  limit: number;
}
export interface UsageBlocked {
  ok: false;
  plan: SubscriptionPlan;
  used: number;
  limit: number;
  error: string;
}
export type UsageResult = UsageOk | UsageBlocked;

async function getSubscription(companyId: string): Promise<Subscription | null> {
  if (!supabaseConfigured) {
    return getStore().subscriptions.find((s) => s.company_id === companyId) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();
    return (data as unknown as Subscription | null) ?? null;
  } catch {
    return null;
  }
}

async function countResource(
  companyId: string,
  resource: UsageResource
): Promise<number> {
  if (!supabaseConfigured) {
    const store = getStore();
    if (resource === "contact")
      return store.contacts.filter((c) => c.company_id === companyId).length;
    if (resource === "project")
      return store.projects.filter((p) => p.company_id === companyId).length;
    return store.employees.filter((e) => e.company_id === companyId).length;
  }
  try {
    const supabase = await createClient();
    const table =
      resource === "contact"
        ? "crm_contacts"
        : resource === "project"
        ? "projects"
        : "company_members";
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function checkUsage(
  companyId: string,
  resource: UsageResource
): Promise<UsageResult> {
  const sub = await getSubscription(companyId);
  const plan: SubscriptionPlan = sub?.plan ?? "starter";
  const limits = PLAN_LIMITS[plan];
  const limit =
    resource === "contact"
      ? limits.max_contacts
      : resource === "project"
      ? limits.max_projects
      : limits.max_users;
  if (isUnlimited(limit)) {
    return { ok: true, plan, used: 0, limit };
  }
  const used = await countResource(companyId, resource);
  if (used >= limit) {
    return {
      ok: false,
      plan,
      used,
      limit,
      error: `${capitalize(plan)} plan reached its ${resource} limit (${used}/${limit}). Upgrade to add more.`,
    };
  }
  return { ok: true, plan, used, limit };
}

export async function getCompanyUsage(companyId: string) {
  const sub = await getSubscription(companyId);
  const plan = sub?.plan ?? "starter";
  const [contacts, projects, users] = await Promise.all([
    countResource(companyId, "contact"),
    countResource(companyId, "project"),
    countResource(companyId, "user"),
  ]);
  return {
    plan,
    status: sub?.status ?? "trialing",
    cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
    currentPeriodEnd: sub?.current_period_end ?? null,
    contacts: { used: contacts, limit: PLAN_LIMITS[plan].max_contacts },
    projects: { used: projects, limit: PLAN_LIMITS[plan].max_projects },
    users: { used: users, limit: PLAN_LIMITS[plan].max_users },
  };
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
