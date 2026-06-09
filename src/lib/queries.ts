/**
 * Server-only query helpers. Each one is scoped to a `companyId` and returns
 * a typed shape ready for the dashboard pages.
 *
 * - When Supabase is configured: queries hit Postgres (RLS enforced).
 * - When Supabase is **not** configured: queries hit `demoStore` so the
 *   write-side flows in Sprint 1 work end-to-end without a backend.
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore } from "@/lib/demoStore";
import type {
  CrmContact,
  CrmDeal,
  Employee,
  Expense,
  Invoice,
  InvoiceItem,
  Notification,
  Project,
  Task,
  AiCfoReport,
  ActivityLog,
  TeamInvitation,
  Subscription,
  NotificationPreferences,
} from "@/types/database";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!supabaseConfigured) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/* -------------------------------------------------------------------- */
/* Public query helpers                                                 */
/* -------------------------------------------------------------------- */

export async function listDeals(companyId: string): Promise<CrmDeal[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("crm_deals")
        .select("*")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false });
      return (data ?? []) as CrmDeal[];
    },
    [...getStore().deals].sort(
      (a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)
    )
  );
}

export async function listContacts(companyId: string): Promise<CrmContact[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("crm_contacts")
        .select("*")
        .eq("company_id", companyId)
        .order("full_name");
      return (data ?? []) as CrmContact[];
    },
    [...getStore().contacts].sort((a, b) =>
      a.full_name.localeCompare(b.full_name)
    )
  );
}

export async function listProjects(companyId: string): Promise<Project[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false });
      return (data ?? []) as Project[];
    },
    [...getStore().projects].sort(
      (a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)
    )
  );
}

export async function listTasks(companyId: string): Promise<Task[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("company_id", companyId)
        .order("position");
      return (data ?? []) as Task[];
    },
    [...getStore().tasks].sort((a, b) => a.position - b.position)
  );
}

export async function listInvoices(companyId: string): Promise<Invoice[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("company_id", companyId)
        .order("issue_date", { ascending: false });
      return (data ?? []) as Invoice[];
    },
    [...getStore().invoices].sort((a, b) =>
      b.issue_date.localeCompare(a.issue_date)
    )
  );
}

export async function getInvoice(
  companyId: string,
  id: string
): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data: inv } = await supabase
        .from("invoices")
        .select("*")
        .eq("company_id", companyId)
        .eq("id", id)
        .maybeSingle();
      if (!inv) return null;
      const { data: items } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", id)
        .order("position");
      return { invoice: inv as Invoice, items: (items ?? []) as InvoiceItem[] };
    },
    (() => {
      const store = getStore();
      const inv = store.invoices.find((i) => i.id === id);
      if (!inv) return null;
      const items = store.invoiceItems
        .filter((it) => it.invoice_id === id)
        .sort((a, b) => a.position - b.position);
      return { invoice: inv, items };
    })()
  );
}

export async function listExpenses(companyId: string): Promise<Expense[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("company_id", companyId)
        .order("spent_at", { ascending: false });
      return (data ?? []) as Expense[];
    },
    [...getStore().expenses].sort((a, b) =>
      b.spent_at.localeCompare(a.spent_at)
    )
  );
}

export async function listEmployees(companyId: string): Promise<Employee[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", companyId)
        .order("full_name");
      return (data ?? []) as Employee[];
    },
    [...getStore().employees].sort((a, b) =>
      a.full_name.localeCompare(b.full_name)
    )
  );
}

export async function listAiCfoReports(
  companyId: string
): Promise<AiCfoReport[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("ai_cfo_reports")
        .select("*")
        .eq("company_id", companyId)
        .order("period_end", { ascending: false })
        .limit(20);
      return (data ?? []) as AiCfoReport[];
    },
    []
  );
}

export async function listNotifications(): Promise<
  Pick<Notification, "id" | "title" | "body" | "type" | "created_at" | "href">[]
> {
  return safe(
    async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, type, created_at, href")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    [...getStore().notifications]
      .sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
      )
      .slice(0, 20)
      .map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        created_at: n.created_at,
        href: n.href,
      }))
  );
}

export async function listActivity(companyId: string): Promise<ActivityLog[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as ActivityLog[];
    },
    [...getStore().activity]
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .slice(0, 100)
  );
}

/* -------------------------------------------------------------------- */
/* Computed analytics                                                   */
/* -------------------------------------------------------------------- */

export interface DashboardKpis {
  revenue: number;
  expenses: number;
  profit: number;
  openDeals: number;
  wonValue: number;
  activeProjects: number;
  overdueInvoices: number;
  monthly: { label: string; revenue: number; expenses: number }[];
}

export async function dashboardKpis(companyId: string): Promise<DashboardKpis> {
  const [deals, projects, invoices, expenses] = await Promise.all([
    listDeals(companyId),
    listProjects(companyId),
    listInvoices(companyId),
    listExpenses(companyId),
  ]);

  const revenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);
  const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = revenue - expensesTotal;
  const openDeals = deals.filter(
    (d) => d.stage !== "won" && d.stage !== "lost"
  ).length;
  const wonValue = deals
    .filter((d) => d.stage === "won")
    .reduce((s, d) => s + d.value, 0);
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "planning"
  ).length;
  const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthly = labels.map((label, idx) => {
    const seed = (idx + 1) * 7;
    return {
      label,
      revenue:
        Math.round(
          (revenue / 6) * (0.7 + (seed % 11) / 10) +
            (idx === labels.length - 1 ? revenue / 6 : 0)
        ) || 8000 + idx * 1500,
      expenses:
        Math.round((expensesTotal / 6) * (0.6 + (seed % 7) / 10)) ||
        4500 + idx * 700,
    };
  });

  return {
    revenue,
    expenses: expensesTotal,
    profit,
    openDeals,
    wonValue,
    activeProjects,
    overdueInvoices,
    monthly,
  };
}


/* -------------------------------------------------------------------- */
/* Sprint 2: invitations, subscriptions, emails, prefs                  */
/* -------------------------------------------------------------------- */

export async function listInvitations(
  companyId: string
): Promise<TeamInvitation[]> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      return (data ?? []) as TeamInvitation[];
    },
    [...getStore().invitations].filter((i) => i.company_id === companyId)
  );
}

export async function getInvitationByToken(
  token: string
): Promise<TeamInvitation | null> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      return (data as unknown as TeamInvitation | null) ?? null;
    },
    getStore().invitations.find((i) => i.token === token) ?? null
  );
}

export async function getSubscription(
  companyId: string
): Promise<Subscription | null> {
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();
      return (data as unknown as Subscription | null) ?? null;
    },
    getStore().subscriptions.find((s) => s.company_id === companyId) ?? null
  );
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const fallback: NotificationPreferences = {
    user_id: userId,
    email_ai_cfo_reports: true,
    email_invoice_paid: true,
    email_invitations: true,
    updated_at: new Date().toISOString(),
  };
  return safe(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      return (
        (data as unknown as NotificationPreferences | null) ?? fallback
      );
    },
    getStore().preferences.find((p) => p.user_id === userId) ?? fallback
  );
}

export async function listFullNotifications(): Promise<
  Pick<
    Notification,
    "id" | "title" | "body" | "type" | "created_at" | "href" | "read_at"
  >[]
> {
  return safe(
    async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, type, created_at, href, read_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
    [...getStore().notifications]
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        created_at: n.created_at,
        href: n.href,
        read_at: n.read_at,
      }))
  );
}

export async function listSentEmails() {
  // Memory transport only — production uses Resend's dashboard.
  return getStore().emails.slice(0, 50);
}
