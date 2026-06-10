-- =====================================================================
-- Nova BusinessOS — Production Supabase schema
-- =====================================================================
-- Multi-tenant SaaS schema. Every business resource is scoped by
-- `company_id`. Row Level Security is enabled on every table and policies
-- restrict access to members of the company.
--
-- Apply with:
--   supabase db reset           # local
--   psql $DATABASE_URL -f supabase/supabase_schema.sql
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Allow forward references inside function bodies. Several helpers
-- (`is_company_member`, `has_company_role`, `auth_company_ids`) read
-- from `public.company_members`, which is created later in this file.
-- Postgres validates `language sql` function bodies at definition time
-- by default — turning the check off here makes the migration safe to
-- apply in one shot. The bodies are still validated on first call.
set check_function_bodies = off;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type company_role as enum ('owner', 'admin', 'manager', 'employee');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum
    ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('todo', 'in_progress', 'in_review', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_stage as enum
    ('lead', 'contacted', 'meeting', 'proposal', 'won', 'lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum
    ('draft', 'sent', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type expense_category as enum
    ('marketing', 'software', 'hosting', 'travel', 'payroll',
     'operations', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('income', 'expense');
exception when duplicate_object then null; end $$;

do $$ begin
  create type employee_status as enum ('active', 'on_leave', 'terminated');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_kind as enum ('note', 'call', 'email', 'meeting', 'task');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_kind as enum
    ('invoice_paid', 'task_assigned', 'lead_won', 'new_employee',
     'ai_insight', 'system');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Helper functions (basic)
-- ---------------------------------------------------------------------

-- updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Company-membership helpers are defined further below, after the
-- `company_members` table exists. `set check_function_bodies = off`
-- above lets us forward-declare them safely if the order ever shifts.

-- ---------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------
create table if not exists public.companies (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  industry    text,
  currency    text not null default 'USD',
  timezone    text not null default 'UTC',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists companies_owner_id_idx on public.companies(owner_id);

drop trigger if exists trg_companies_updated_at on public.companies;
create trigger trg_companies_updated_at
  before update on public.companies
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- company_members
-- ---------------------------------------------------------------------
create table if not exists public.company_members (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        company_role not null default 'employee',
  created_at  timestamptz not null default now(),
  unique (company_id, user_id)
);

create index if not exists company_members_user_idx on public.company_members(user_id);
create index if not exists company_members_company_idx on public.company_members(company_id);

-- ---------------------------------------------------------------------
-- Membership helper functions
-- (defined here, after `company_members` exists, for clarity)
-- ---------------------------------------------------------------------

-- Returns the set of company_ids the current auth.uid() belongs to.
create or replace function auth_company_ids()
returns setof uuid language sql security definer stable as $$
  select company_id
  from public.company_members
  where user_id = auth.uid();
$$;

-- Returns true if current user is a member of the given company.
create or replace function is_company_member(c_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.company_members
    where company_id = c_id and user_id = auth.uid()
  );
$$;

-- Returns true if current user has at least one of the given roles in company.
create or replace function has_company_role(c_id uuid, roles company_role[])
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.company_members
    where company_id = c_id
      and user_id = auth.uid()
      and role = any(roles)
  );
$$;

-- Auto-add owner as company_member upon company creation
create or replace function ensure_owner_membership()
returns trigger language plpgsql security definer as $$
begin
  insert into public.company_members(company_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (company_id, user_id) do nothing;
  return new;
end $$;

drop trigger if exists trg_companies_owner_member on public.companies;
create trigger trg_companies_owner_member
  after insert on public.companies
  for each row execute function ensure_owner_membership();

-- ---------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  name         text not null,
  description  text,
  status       project_status not null default 'planning',
  client_id    uuid,                          -- FK added below after crm_contacts exists
  budget       numeric(14,2),
  start_date   date,
  due_date     date,
  created_by   uuid not null references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists projects_company_idx on public.projects(company_id);
create index if not exists projects_status_idx on public.projects(status);
drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------
create table if not exists public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete cascade,
  title        text not null,
  description  text,
  status       task_status not null default 'todo',
  priority     task_priority not null default 'medium',
  assigned_to  uuid references auth.users(id) on delete set null,
  due_date     date,
  position     integer not null default 0,
  created_by   uuid not null references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists tasks_company_idx on public.tasks(company_id);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_assignee_idx on public.tasks(assigned_to);
drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at before update on public.tasks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- CRM
-- ---------------------------------------------------------------------
create table if not exists public.crm_contacts (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  full_name    text not null,
  email        citext,
  phone        text,
  company_name text,
  title        text,
  source       text,
  notes        text,
  owner_id     uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists crm_contacts_company_idx on public.crm_contacts(company_id);
create index if not exists crm_contacts_email_idx on public.crm_contacts(company_id, email);
drop trigger if exists trg_crm_contacts_updated_at on public.crm_contacts;
create trigger trg_crm_contacts_updated_at before update on public.crm_contacts
  for each row execute function set_updated_at();

create table if not exists public.crm_deals (
  id              uuid primary key default uuid_generate_v4(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  contact_id      uuid references public.crm_contacts(id) on delete set null,
  title           text not null,
  value           numeric(14,2) not null default 0,
  currency        text not null default 'USD',
  stage           lead_stage not null default 'lead',
  probability     integer not null default 25 check (probability between 0 and 100),
  expected_close  date,
  owner_id        uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists crm_deals_company_idx on public.crm_deals(company_id);
create index if not exists crm_deals_stage_idx on public.crm_deals(company_id, stage);
drop trigger if exists trg_crm_deals_updated_at on public.crm_deals;
create trigger trg_crm_deals_updated_at before update on public.crm_deals
  for each row execute function set_updated_at();

create table if not exists public.crm_activities (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  contact_id  uuid references public.crm_contacts(id) on delete cascade,
  deal_id     uuid references public.crm_deals(id) on delete cascade,
  type        activity_kind not null default 'note',
  subject     text not null,
  body        text,
  due_at      timestamptz,
  done        boolean not null default false,
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);
create index if not exists crm_activities_company_idx on public.crm_activities(company_id);
create index if not exists crm_activities_contact_idx on public.crm_activities(contact_id);
create index if not exists crm_activities_deal_idx on public.crm_activities(deal_id);

-- Now add the FK from projects.client_id back into crm_contacts (created above)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_client_fk'
  ) then
    alter table public.projects
      add constraint projects_client_fk
      foreign key (client_id) references public.crm_contacts(id) on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Invoicing
-- ---------------------------------------------------------------------
create table if not exists public.invoices (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  number       text not null,
  contact_id   uuid references public.crm_contacts(id) on delete set null,
  status       invoice_status not null default 'draft',
  issue_date   date not null default current_date,
  due_date     date,
  subtotal     numeric(14,2) not null default 0,
  tax_rate     numeric(5,2)  not null default 0,
  tax_amount   numeric(14,2) not null default 0,
  total        numeric(14,2) not null default 0,
  currency     text not null default 'USD',
  notes        text,
  created_by   uuid not null references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (company_id, number)
);
create index if not exists invoices_company_idx on public.invoices(company_id);
create index if not exists invoices_status_idx  on public.invoices(company_id, status);
drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at before update on public.invoices
  for each row execute function set_updated_at();

create table if not exists public.invoice_items (
  id          uuid primary key default uuid_generate_v4(),
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity    numeric(14,2) not null default 1,
  unit_price  numeric(14,2) not null default 0,
  amount      numeric(14,2) not null default 0,
  position    integer not null default 0
);
create index if not exists invoice_items_invoice_idx on public.invoice_items(invoice_id);

-- Recompute invoice totals when items change
create or replace function recompute_invoice_totals()
returns trigger language plpgsql as $$
declare
  inv_id uuid := coalesce(new.invoice_id, old.invoice_id);
  sub numeric(14,2);
  rate numeric(5,2);
begin
  select coalesce(sum(quantity * unit_price), 0)
    into sub from public.invoice_items where invoice_id = inv_id;
  select tax_rate into rate from public.invoices where id = inv_id;
  update public.invoices
    set subtotal   = sub,
        tax_amount = round(sub * coalesce(rate, 0) / 100, 2),
        total      = sub + round(sub * coalesce(rate, 0) / 100, 2)
    where id = inv_id;
  return null;
end $$;

drop trigger if exists trg_invoice_items_totals on public.invoice_items;
create trigger trg_invoice_items_totals
  after insert or update or delete on public.invoice_items
  for each row execute function recompute_invoice_totals();

-- ---------------------------------------------------------------------
-- Expenses
-- ---------------------------------------------------------------------
create table if not exists public.expenses (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  category     expense_category not null default 'other',
  vendor       text not null,
  amount       numeric(14,2) not null default 0,
  currency     text not null default 'USD',
  spent_at     date not null default current_date,
  receipt_url  text,
  notes        text,
  created_by   uuid not null references auth.users(id),
  created_at   timestamptz not null default now()
);
create index if not exists expenses_company_idx on public.expenses(company_id);
create index if not exists expenses_category_idx on public.expenses(company_id, category);
create index if not exists expenses_spent_at_idx on public.expenses(company_id, spent_at);

-- ---------------------------------------------------------------------
-- Financial transactions (unified ledger for charts)
-- ---------------------------------------------------------------------
create table if not exists public.financial_transactions (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  type          transaction_type not null,
  amount        numeric(14,2) not null,
  currency      text not null default 'USD',
  occurred_at   date not null default current_date,
  category      text,
  source_type   text check (source_type in ('invoice', 'expense', 'manual')),
  source_id     uuid,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists fin_tx_company_idx on public.financial_transactions(company_id);
create index if not exists fin_tx_occurred_idx on public.financial_transactions(company_id, occurred_at);
create index if not exists fin_tx_type_idx on public.financial_transactions(company_id, type);

-- Auto-create transaction on invoice.status -> paid
create or replace function fin_tx_from_invoice()
returns trigger language plpgsql as $$
begin
  if (new.status = 'paid' and (old.status is distinct from 'paid')) then
    insert into public.financial_transactions
      (company_id, type, amount, currency, occurred_at,
       category, source_type, source_id, notes)
    values
      (new.company_id, 'income', new.total, new.currency, current_date,
       'invoice', 'invoice', new.id,
       'Invoice ' || new.number || ' marked paid');
  end if;
  return new;
end $$;

drop trigger if exists trg_fin_tx_from_invoice on public.invoices;
create trigger trg_fin_tx_from_invoice
  after update on public.invoices
  for each row execute function fin_tx_from_invoice();

-- Auto-create transaction on expense insert
create or replace function fin_tx_from_expense()
returns trigger language plpgsql as $$
begin
  insert into public.financial_transactions
    (company_id, type, amount, currency, occurred_at,
     category, source_type, source_id, notes)
  values
    (new.company_id, 'expense', new.amount, new.currency, new.spent_at,
     new.category::text, 'expense', new.id, new.vendor);
  return new;
end $$;

drop trigger if exists trg_fin_tx_from_expense on public.expenses;
create trigger trg_fin_tx_from_expense
  after insert on public.expenses
  for each row execute function fin_tx_from_expense();

-- ---------------------------------------------------------------------
-- Employees
-- ---------------------------------------------------------------------
create table if not exists public.employees (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  full_name   text not null,
  email       citext,
  role_title  text,
  department  text,
  hired_at    date,
  status      employee_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists employees_company_idx on public.employees(company_id);
drop trigger if exists trg_employees_updated_at on public.employees;
create trigger trg_employees_updated_at before update on public.employees
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- AI CFO reports
-- ---------------------------------------------------------------------
create table if not exists public.ai_cfo_reports (
  id              uuid primary key default uuid_generate_v4(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  period_start    date not null,
  period_end      date not null,
  summary         text not null,
  insights        jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  forecast        jsonb,
  created_at      timestamptz not null default now()
);
create index if not exists ai_cfo_reports_company_idx
  on public.ai_cfo_reports(company_id, period_end desc);

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  body        text,
  href        text,
  type        notification_kind not null default 'system',
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx
  on public.notifications(user_id, read_at, created_at desc);

-- ---------------------------------------------------------------------
-- Activity log
-- ---------------------------------------------------------------------
create table if not exists public.activity_logs (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  actor_id     uuid references auth.users(id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists activity_logs_company_idx
  on public.activity_logs(company_id, created_at desc);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.companies            enable row level security;
alter table public.company_members      enable row level security;
alter table public.projects             enable row level security;
alter table public.tasks                enable row level security;
alter table public.crm_contacts         enable row level security;
alter table public.crm_deals            enable row level security;
alter table public.crm_activities       enable row level security;
alter table public.invoices             enable row level security;
alter table public.invoice_items        enable row level security;
alter table public.expenses             enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.employees            enable row level security;
alter table public.ai_cfo_reports       enable row level security;
alter table public.notifications        enable row level security;
alter table public.activity_logs        enable row level security;

-- companies: visible to members; only the owner may delete; owners/admins may update
drop policy if exists "companies_select" on public.companies;
create policy "companies_select" on public.companies
  for select using (is_company_member(id));

drop policy if exists "companies_insert" on public.companies;
create policy "companies_insert" on public.companies
  for insert with check (auth.uid() = owner_id);

drop policy if exists "companies_update" on public.companies;
create policy "companies_update" on public.companies
  for update using (has_company_role(id, array['owner','admin']::company_role[]));

drop policy if exists "companies_delete" on public.companies;
create policy "companies_delete" on public.companies
  for delete using (auth.uid() = owner_id);

-- company_members: members can read; owners/admins can manage
drop policy if exists "members_select" on public.company_members;
create policy "members_select" on public.company_members
  for select using (is_company_member(company_id));

drop policy if exists "members_insert" on public.company_members;
create policy "members_insert" on public.company_members
  for insert with check (
    auth.uid() = user_id  -- self-join via invite token (server-side)
    or has_company_role(company_id, array['owner','admin']::company_role[])
  );

drop policy if exists "members_update" on public.company_members;
create policy "members_update" on public.company_members
  for update using (has_company_role(company_id, array['owner','admin']::company_role[]));

drop policy if exists "members_delete" on public.company_members;
create policy "members_delete" on public.company_members
  for delete using (has_company_role(company_id, array['owner','admin']::company_role[]));

-- Generic "scoped to company" policy generator pattern
do $$
declare
  t text;
  scoped_tables text[] := array[
    'projects','tasks','crm_contacts','crm_deals','crm_activities',
    'invoices','expenses','financial_transactions','employees',
    'ai_cfo_reports','activity_logs'
  ];
begin
  foreach t in array scoped_tables loop
    execute format('drop policy if exists "%1$s_select" on public.%1$s;', t);
    execute format(
      'create policy "%1$s_select" on public.%1$s for select using (is_company_member(company_id));',
      t);
    execute format('drop policy if exists "%1$s_modify" on public.%1$s;', t);
    execute format(
      'create policy "%1$s_modify" on public.%1$s for all '
      'using (is_company_member(company_id)) '
      'with check (is_company_member(company_id));',
      t);
  end loop;
end $$;

-- invoice_items: scope via parent invoice
drop policy if exists "invoice_items_select" on public.invoice_items;
create policy "invoice_items_select" on public.invoice_items
  for select using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and is_company_member(i.company_id)
    )
  );

drop policy if exists "invoice_items_modify" on public.invoice_items;
create policy "invoice_items_modify" on public.invoice_items
  for all using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and is_company_member(i.company_id)
    )
  ) with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and is_company_member(i.company_id)
    )
  );

-- notifications: only the recipient
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications
  for update using (user_id = auth.uid());

drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications
  for insert with check (is_company_member(company_id));

-- =====================================================================
-- Convenience views
-- =====================================================================
create or replace view public.v_company_kpis as
select
  c.id as company_id,
  coalesce((select sum(amount) from public.financial_transactions ft
              where ft.company_id = c.id and ft.type = 'income'), 0) as total_revenue,
  coalesce((select sum(amount) from public.financial_transactions ft
              where ft.company_id = c.id and ft.type = 'expense'), 0) as total_expenses,
  coalesce((select sum(amount) from public.financial_transactions ft
              where ft.company_id = c.id and ft.type = 'income'), 0) -
  coalesce((select sum(amount) from public.financial_transactions ft
              where ft.company_id = c.id and ft.type = 'expense'), 0) as profit,
  (select count(*) from public.crm_deals d
     where d.company_id = c.id and d.stage = 'won') as deals_won,
  (select count(*) from public.invoices i
     where i.company_id = c.id and i.status = 'overdue') as invoices_overdue
from public.companies c;

-- =====================================================================
-- Done.
-- =====================================================================


-- =====================================================================
-- Sprint 1: Receipts storage bucket
-- =====================================================================
-- The expenses module uploads receipts (images / PDFs) through the
-- /api/expenses/receipt route. Files are stored in the "receipts" bucket
-- under the path `<company_id>/<user_id>/<file>`. Public read URLs are
-- handed back via storage.publicUrl(); writes are gated by RLS-style
-- policies on `storage.objects` so a member can only manage receipts
-- belonging to their own company.

insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', true)
  on conflict (id) do nothing;

-- Read: any authenticated member of the company that owns the path
drop policy if exists "receipts_select" on storage.objects;
create policy "receipts_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and is_company_member((storage.foldername(name))[1]::uuid)
  );

-- Insert: only members of the company can upload into their folder
drop policy if exists "receipts_insert" on storage.objects;
create policy "receipts_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and is_company_member((storage.foldername(name))[1]::uuid)
  );

-- Update / Delete: same rule
drop policy if exists "receipts_update" on storage.objects;
create policy "receipts_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'receipts'
    and is_company_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "receipts_delete" on storage.objects;
create policy "receipts_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'receipts'
    and is_company_member((storage.foldername(name))[1]::uuid)
  );


-- =====================================================================
-- Sprint 2: Team invitations, subscriptions, notification read state
-- =====================================================================

do $$ begin
  create type subscription_plan as enum ('starter', 'business', 'enterprise');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum
    ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------------ --
-- team_invitations
-- ------------------------------------------------------------------ --
create table if not exists public.team_invitations (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  email        citext not null,
  role         company_role not null default 'employee',
  token        text not null unique,
  invited_by   uuid not null references auth.users(id),
  expires_at   timestamptz not null default (now() + interval '14 days'),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists team_invitations_company_idx
  on public.team_invitations(company_id, accepted_at);
create index if not exists team_invitations_email_idx
  on public.team_invitations(email);

alter table public.team_invitations enable row level security;

drop policy if exists "team_invitations_select" on public.team_invitations;
create policy "team_invitations_select" on public.team_invitations
  for select using (is_company_member(company_id));

drop policy if exists "team_invitations_modify" on public.team_invitations;
create policy "team_invitations_modify" on public.team_invitations
  for all using (
    has_company_role(company_id, array['owner','admin','manager']::company_role[])
  ) with check (
    has_company_role(company_id, array['owner','admin','manager']::company_role[])
  );

-- ------------------------------------------------------------------ --
-- subscriptions
-- ------------------------------------------------------------------ --
create table if not exists public.subscriptions (
  id                       uuid primary key default uuid_generate_v4(),
  company_id               uuid not null references public.companies(id) on delete cascade,
  stripe_customer_id       text,
  stripe_subscription_id   text unique,
  plan                     subscription_plan not null default 'starter',
  status                   subscription_status not null default 'trialing',
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  trial_end                timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (company_id)
);

create index if not exists subscriptions_company_idx
  on public.subscriptions(company_id);
create index if not exists subscriptions_customer_idx
  on public.subscriptions(stripe_customer_id);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute function set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select" on public.subscriptions;
create policy "subscriptions_select" on public.subscriptions
  for select using (is_company_member(company_id));

drop policy if exists "subscriptions_admin_modify" on public.subscriptions;
create policy "subscriptions_admin_modify" on public.subscriptions
  for all using (
    has_company_role(company_id, array['owner','admin']::company_role[])
  ) with check (
    has_company_role(company_id, array['owner','admin']::company_role[])
  );

-- ------------------------------------------------------------------ --
-- Optional per-user preference: receive AI CFO email digests
-- ------------------------------------------------------------------ --
create table if not exists public.notification_preferences (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  email_ai_cfo_reports boolean not null default true,
  email_invoice_paid   boolean not null default true,
  email_invitations    boolean not null default true,
  updated_at           timestamptz not null default now()
);

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function set_updated_at();

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_self" on public.notification_preferences;
create policy "notification_preferences_self" on public.notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
