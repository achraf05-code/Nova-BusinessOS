import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { Company, CompanyRole } from "@/types/database";

const COOKIE_KEY = "nova_company_id";

const DEMO_COMPANY: Company = {
  id: "demo-company",
  owner_id: "demo-user",
  name: "Voltage Studio",
  slug: "voltage-studio",
  logo_url: null,
  industry: "SaaS",
  currency: "USD",
  timezone: "UTC",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_USER = { id: "demo-user", email: "demo@mabusinessos.com" };

/**
 * Resolve the active company for the signed-in user. The active company is
 * stored in a cookie; when missing we fall back to the first company the
 * user belongs to (ordered by creation date).
 *
 * When Supabase is not configured a deterministic demo workspace is
 * returned so the dashboard remains fully demoable without a backend.
 */
export async function getActiveCompany(): Promise<{
  user: { id: string; email: string | null };
  company: Company;
  role: CompanyRole;
  companies: Company[];
} | null> {
  if (!supabaseConfigured) {
    return {
      user: DEMO_USER,
      company: DEMO_COMPANY,
      role: "owner",
      companies: [DEMO_COMPANY],
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: memberships } = await supabase
    .from("company_members")
    .select("role, company:companies(*)")
    .order("created_at", { ascending: true });

  type Membership = { role: CompanyRole; company: Company };
  const rows = (memberships ?? []) as unknown as Membership[];
  if (rows.length === 0) return null;

  const companies: Company[] = rows.map((r) => r.company);
  const cookieStore = await cookies();
  const desired = cookieStore.get(COOKIE_KEY)?.value;
  const active = rows.find((r) => r.company.id === desired) ?? rows[0];

  return {
    user: { id: user.id, email: user.email ?? null },
    company: active.company,
    role: active.role,
    companies,
  };
}

/**
 * Return the active company or throw. Callers should wrap with `redirect`.
 */
export async function requireActiveCompany() {
  const ctx = await getActiveCompany();
  if (!ctx) {
    throw new Error("NO_ACTIVE_COMPANY");
  }
  return ctx;
}

export const ACTIVE_COMPANY_COOKIE = COOKIE_KEY;

/* RBAC helpers ------------------------------------------------------- */

const RANK: Record<CompanyRole, number> = {
  owner: 4,
  admin: 3,
  manager: 2,
  employee: 1,
};

export function hasRole(actual: CompanyRole, atLeast: CompanyRole): boolean {
  return RANK[actual] >= RANK[atLeast];
}

export function canManageBilling(role: CompanyRole) {
  return hasRole(role, "admin");
}
export function canManageTeam(role: CompanyRole) {
  return hasRole(role, "admin");
}
export function canEditFinance(role: CompanyRole) {
  return hasRole(role, "manager");
}
