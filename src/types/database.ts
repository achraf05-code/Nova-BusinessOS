/**
 * Nova BusinessOS — Supabase database types.
 *
 * This is a compact, hand-curated mirror of the SQL schema in
 * `supabase/supabase_schema.sql`. Regenerate with the Supabase CLI for the
 * full canonical type set:
 *
 *     npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CompanyRole = "owner" | "admin" | "manager" | "employee";

export type SubscriptionPlan = "starter" | "business" | "enterprise";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type LeadStage =
  | "lead"
  | "contacted"
  | "meeting"
  | "proposal"
  | "won"
  | "lost";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";

export type ExpenseCategory =
  | "marketing"
  | "software"
  | "hosting"
  | "travel"
  | "payroll"
  | "operations"
  | "other";

export type TransactionType = "income" | "expense";

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  created_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  client_id: string | null;
  budget: number | null;
  start_date: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  company_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  due_date: string | null;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CrmContact {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  title: string | null;
  source: string | null;
  notes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmDeal {
  id: string;
  company_id: string;
  contact_id: string | null;
  title: string;
  value: number;
  currency: string;
  stage: LeadStage;
  probability: number;
  expected_close: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmActivity {
  id: string;
  company_id: string;
  contact_id: string | null;
  deal_id: string | null;
  type: "note" | "call" | "email" | "meeting" | "task";
  subject: string;
  body: string | null;
  due_at: string | null;
  done: boolean;
  created_by: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  number: string;
  contact_id: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  position: number;
}

export interface Expense {
  id: string;
  company_id: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  currency: string;
  spent_at: string;
  receipt_url: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface FinancialTransaction {
  id: string;
  company_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  occurred_at: string;
  category: string | null;
  source_type: "invoice" | "expense" | "manual" | null;
  source_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  role_title: string | null;
  department: string | null;
  hired_at: string | null;
  status: "active" | "on_leave" | "terminated";
  created_at: string;
  updated_at: string;
}

export interface AiCfoReport {
  id: string;
  company_id: string;
  period_start: string;
  period_end: string;
  summary: string;
  insights: Json;
  recommendations: Json;
  forecast: Json | null;
  created_at: string;
}

export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  title: string;
  body: string | null;
  href: string | null;
  type:
    | "invoice_paid"
    | "task_assigned"
    | "lead_won"
    | "new_employee"
    | "ai_insight"
    | "system";
  read_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  company_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  company_id: string;
  email: string;
  role: CompanyRole;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_ai_cfo_reports: boolean;
  email_invoice_paid: boolean;
  email_invitations: boolean;
  updated_at: string;
}

/* ----------------------------------------------------------------------- */
/* Supabase generated-style "Database" surface                             */
/* ----------------------------------------------------------------------- */

type Row<T> = T;
type Insert<T> = Partial<T> & { id?: string };
type Update<T> = Partial<T>;

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Row<Company>;
        Insert: Insert<Company>;
        Update: Update<Company>;
      };
      company_members: {
        Row: Row<CompanyMember>;
        Insert: Insert<CompanyMember>;
        Update: Update<CompanyMember>;
      };
      projects: {
        Row: Row<Project>;
        Insert: Insert<Project>;
        Update: Update<Project>;
      };
      tasks: {
        Row: Row<Task>;
        Insert: Insert<Task>;
        Update: Update<Task>;
      };
      crm_contacts: {
        Row: Row<CrmContact>;
        Insert: Insert<CrmContact>;
        Update: Update<CrmContact>;
      };
      crm_deals: {
        Row: Row<CrmDeal>;
        Insert: Insert<CrmDeal>;
        Update: Update<CrmDeal>;
      };
      crm_activities: {
        Row: Row<CrmActivity>;
        Insert: Insert<CrmActivity>;
        Update: Update<CrmActivity>;
      };
      invoices: {
        Row: Row<Invoice>;
        Insert: Insert<Invoice>;
        Update: Update<Invoice>;
      };
      invoice_items: {
        Row: Row<InvoiceItem>;
        Insert: Insert<InvoiceItem>;
        Update: Update<InvoiceItem>;
      };
      expenses: {
        Row: Row<Expense>;
        Insert: Insert<Expense>;
        Update: Update<Expense>;
      };
      financial_transactions: {
        Row: Row<FinancialTransaction>;
        Insert: Insert<FinancialTransaction>;
        Update: Update<FinancialTransaction>;
      };
      employees: {
        Row: Row<Employee>;
        Insert: Insert<Employee>;
        Update: Update<Employee>;
      };
      ai_cfo_reports: {
        Row: Row<AiCfoReport>;
        Insert: Insert<AiCfoReport>;
        Update: Update<AiCfoReport>;
      };
      notifications: {
        Row: Row<Notification>;
        Insert: Insert<Notification>;
        Update: Update<Notification>;
      };
      activity_logs: {
        Row: Row<ActivityLog>;
        Insert: Insert<ActivityLog>;
        Update: Update<ActivityLog>;
      };
      team_invitations: {
        Row: Row<TeamInvitation>;
        Insert: Insert<TeamInvitation>;
        Update: Update<TeamInvitation>;
      };
      subscriptions: {
        Row: Row<Subscription>;
        Insert: Insert<Subscription>;
        Update: Update<Subscription>;
      };
      notification_preferences: {
        Row: Row<NotificationPreferences>;
        Insert: Insert<NotificationPreferences>;
        Update: Update<NotificationPreferences>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      company_role: CompanyRole;
      project_status: ProjectStatus;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      lead_stage: LeadStage;
      invoice_status: InvoiceStatus;
      expense_category: ExpenseCategory;
      transaction_type: TransactionType;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
    };
  };
}
