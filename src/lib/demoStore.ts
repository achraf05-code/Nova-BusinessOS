/**
 * In-memory store used as a fallback when Supabase isn't configured.
 *
 * - Lives only for the lifetime of the Node process (in dev: until restart).
 * - Lets every Sprint-1 mutation flow work end-to-end so a real user can
 *   create / edit / delete contacts, deals, projects, tasks, invoices,
 *   expenses and notifications without a backend.
 * - Production deployments must set Supabase env vars; the store is
 *   bypassed automatically when `supabaseConfigured` is true.
 */

import type {
  CrmContact,
  CrmDeal,
  Employee,
  Expense,
  Invoice,
  InvoiceItem,
  Notification,
  NotificationPreferences,
  Project,
  Subscription,
  Task,
  TeamInvitation,
  ActivityLog,
  Company,
} from "@/types/database";

interface Store {
  initialized: boolean;
  contacts: CrmContact[];
  deals: CrmDeal[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  expenses: Expense[];
  employees: Employee[];
  notifications: Notification[];
  activity: ActivityLog[];
  invitations: TeamInvitation[];
  subscriptions: Subscription[];
  preferences: NotificationPreferences[];
  emails: SentEmail[];
  company: Company;
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  template: string;
  created_at: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __novaDemoStore: Store | undefined;
}

const DEMO_COMPANY_ID = "demo-company";
const DEMO_USER_ID = "demo-user";

function nowIso() {
  return new Date().toISOString();
}

function rid() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function seed(): Store {
  const company: Company = {
    id: DEMO_COMPANY_ID,
    owner_id: DEMO_USER_ID,
    name: "Voltage Studio",
    slug: "voltage-studio",
    logo_url: null,
    industry: "SaaS",
    currency: "USD",
    timezone: "UTC",
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  const contacts: CrmContact[] = [
    mkContact("Léa Rousseau", "lea@voltage.studio", "Voltage Studio", "COO"),
    mkContact("Daniel Park", "daniel@northwind.io", "Northwind Labs", "Founder"),
    mkContact("Hiroshi Tanaka", "hiroshi@atlas.cap", "Atlas Capital", "Partner"),
    mkContact("Marina Costa", "marina@helios.vc", "Helios Ventures", "Principal"),
    mkContact("Jordan Smith", "jordan@quanta.io", "Quanta", "CTO"),
  ];

  const deals: CrmDeal[] = [
    mkDeal("Acme Web Redesign · Acme Inc.", 14200, "proposal", 70, contacts[0].id),
    mkDeal("Voltage Annual Plan", 24000, "won", 100, contacts[0].id),
    mkDeal("Northwind Onboarding", 7800, "meeting", 40, contacts[1].id),
    mkDeal("Atlas Holdings Pilot", 60000, "contacted", 25, contacts[2].id),
    mkDeal("Helios Dashboard", 9300, "lead", 10, contacts[3].id),
    mkDeal("Quanta Migration", 18400, "won", 100, contacts[4].id),
    mkDeal("Lumen Bookkeeping · Lumen Systems", 4200, "lost", 0, null),
  ];

  const projects: Project[] = [
    mkProject("Acme Website Redesign", "in_progress", 14200, "2026-08-30"),
    mkProject("Voltage Mobile App", "in_progress", 38000, "2026-10-15"),
    mkProject("Northwind Onboarding", "planning", 7800, "2026-09-05"),
    mkProject("Atlas Data Migration", "on_hold", 22000, "2026-11-01"),
  ];

  const tasks: Task[] = [
    mkTask("Draft proposal for Acme", "todo", "high", "2026-06-15", 0),
    mkTask("Wireframe Voltage screens", "in_progress", "medium", "2026-06-12", 1),
    mkTask("Send invoice #2026-014", "in_review", "urgent", "2026-06-10", 2),
    mkTask("Onboard new employee", "done", "low", "2026-06-04", 3),
    mkTask("Reconcile May expenses", "todo", "medium", "2026-06-20", 4),
    mkTask("Launch retargeting campaign", "in_progress", "high", "2026-06-18", 5),
  ];

  const invoices: Invoice[] = [
    mkInvoice("2026-014", "Acme Inc.", 14200, "sent"),
    mkInvoice("2026-013", "Voltage Studio", 24000, "paid"),
    mkInvoice("2026-012", "Northwind Labs", 7800, "draft"),
    mkInvoice("2026-011", "Helios Ventures", 4200, "overdue"),
    mkInvoice("2026-010", "Atlas Capital", 9600, "paid"),
  ];

  const invoiceItems: InvoiceItem[] = invoices.flatMap((inv) => [
    {
      id: rid(),
      invoice_id: inv.id,
      description: "Professional services",
      quantity: 1,
      unit_price: inv.total,
      amount: inv.total,
      position: 0,
    },
  ]);

  const expenses: Expense[] = [
    mkExpense("Google Ads", "marketing", 2400, "2026-06-02"),
    mkExpense("AWS", "hosting", 1180, "2026-06-01"),
    mkExpense("Linear", "software", 96, "2026-06-01"),
    mkExpense("Air France", "travel", 720, "2026-05-28"),
    mkExpense("Stripe processing fees", "operations", 360, "2026-05-31"),
    mkExpense("Payroll — June", "payroll", 18900, "2026-06-01"),
  ];

  const employees: Employee[] = [
    mkEmployee("Hannah Lee", "Designer", "Design"),
    mkEmployee("Marco Rossi", "Backend Engineer", "Engineering"),
    mkEmployee("Priya Iyer", "AE", "Sales"),
    mkEmployee("Diego Alvarez", "Customer Success", "Support"),
  ];

  const notifications: Notification[] = [
    mkNotif("Invoice 2026-013 marked paid", "Voltage Studio paid $24,000.", "invoice_paid", "/dashboard/invoices"),
    mkNotif("New AI CFO insight", "Marketing spend +25% — pipeline only +6%.", "ai_insight", "/dashboard/ai-cfo"),
    mkNotif("Lead won — Quanta", "Quanta moved to Won — +$18,400.", "lead_won", "/dashboard/crm"),
  ];

  return {
    initialized: true,
    contacts,
    deals,
    projects,
    tasks,
    invoices,
    invoiceItems,
    expenses,
    employees,
    notifications,
    activity: [],
    invitations: [],
    subscriptions: [
      {
        id: rid(),
        company_id: DEMO_COMPANY_ID,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        plan: "starter",
        status: "trialing",
        current_period_end: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancel_at_period_end: false,
        trial_end: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: nowIso(),
        updated_at: nowIso(),
      },
    ],
    preferences: [
      {
        user_id: DEMO_USER_ID,
        email_ai_cfo_reports: true,
        email_invoice_paid: true,
        email_invitations: true,
        updated_at: nowIso(),
      },
    ],
    emails: [],
    company,
  };
}

function mkContact(
  full_name: string,
  email: string,
  company_name: string,
  title: string
): CrmContact {
  return {
    id: rid(),
    company_id: DEMO_COMPANY_ID,
    full_name,
    email,
    phone: null,
    company_name,
    title,
    source: "website",
    notes: null,
    owner_id: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}
function mkDeal(
  title: string,
  value: number,
  stage: CrmDeal["stage"],
  probability: number,
  contact_id: string | null
): CrmDeal {
  return {
    id: rid(),
    company_id: DEMO_COMPANY_ID,
    contact_id,
    title,
    value,
    currency: "USD",
    stage,
    probability,
    expected_close: null,
    owner_id: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}
function mkProject(
  name: string,
  status: Project["status"],
  budget: number,
  due: string
): Project {
  return {
    id: rid(),
    company_id: DEMO_COMPANY_ID,
    name,
    description: null,
    status,
    client_id: null,
    budget,
    start_date: null,
    due_date: due,
    created_by: DEMO_USER_ID,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}
function mkTask(
  title: string,
  status: Task["status"],
  priority: Task["priority"],
  due: string,
  position: number
): Task {
  return {
    id: rid(),
    company_id: DEMO_COMPANY_ID,
    project_id: null,
    title,
    description: null,
    status,
    priority,
    assigned_to: null,
    due_date: due,
    position,
    created_by: DEMO_USER_ID,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}
function mkInvoice(
  number: string,
  client: string,
  total: number,
  status: Invoice["status"]
): Invoice {
  return {
    id: rid(),
    company_id: DEMO_COMPANY_ID,
    number,
    contact_id: null,
    status,
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: null,
    subtotal: total,
    tax_rate: 0,
    tax_amount: 0,
    total,
    currency: "USD",
    notes: client,
    created_by: DEMO_USER_ID,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}
function mkExpense(
  vendor: string,
  category: Expense["category"],
  amount: number,
  spent_at: string
): Expense {
  return {
    id: rid(),
    company_id: DEMO_COMPANY_ID,
    category,
    vendor,
    amount,
    currency: "USD",
    spent_at,
    receipt_url: null,
    notes: null,
    created_by: DEMO_USER_ID,
    created_at: nowIso(),
  };
}
function mkEmployee(
  full_name: string,
  role_title: string,
  department: string
): Employee {
  return {
    id: rid(),
    company_id: DEMO_COMPANY_ID,
    user_id: null,
    full_name,
    email: full_name.toLowerCase().replace(/\W+/g, ".") + "@nova.example",
    role_title,
    department,
    hired_at: null,
    status: "active",
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}
function mkNotif(
  title: string,
  body: string | null,
  type: Notification["type"],
  href: string | null
): Notification {
  return {
    id: rid(),
    company_id: DEMO_COMPANY_ID,
    user_id: DEMO_USER_ID,
    title,
    body,
    href,
    type,
    read_at: null,
    created_at: nowIso(),
  };
}

export function getStore(): Store {
  if (!globalThis.__novaDemoStore) {
    globalThis.__novaDemoStore = seed();
  }
  return globalThis.__novaDemoStore;
}

export function newId() {
  return rid();
}
export function isoNow() {
  return nowIso();
}
export const DEMO = {
  COMPANY_ID: DEMO_COMPANY_ID,
  USER_ID: DEMO_USER_ID,
};
