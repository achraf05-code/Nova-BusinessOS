-- =====================================================================
-- MaBusinessOS — Demo seed
-- =====================================================================
-- Run this against a local Supabase instance after `supabase_schema.sql`.
-- Replace `<DEMO_USER_ID>` with the auth.users.id of your dev account.
-- =====================================================================
do $$
declare
  demo_user uuid := '00000000-0000-0000-0000-000000000001';
  c1        uuid := uuid_generate_v4();
  c2        uuid := uuid_generate_v4();
  ct1       uuid := uuid_generate_v4();
  inv1      uuid := uuid_generate_v4();
begin
  -- companies
  insert into public.companies (id, owner_id, name, slug, currency)
  values
    (c1, demo_user, 'Voltage Studio', 'voltage-studio', 'USD'),
    (c2, demo_user, 'Atlas Capital',  'atlas-capital',  'USD');

  -- contacts
  insert into public.crm_contacts (id, company_id, full_name, email, company_name, title)
  values
    (ct1, c1, 'Léa Rousseau', 'lea@voltage.studio', 'Voltage Studio', 'COO');

  -- deals
  insert into public.crm_deals (company_id, contact_id, title, value, stage, probability)
  values
    (c1, ct1, 'Acme Web Redesign · Acme Inc.', 14200, 'proposal', 70),
    (c1, ct1, 'Voltage Annual Plan',           24000, 'won',      100),
    (c1, ct1, 'Northwind Onboarding',           7800, 'meeting',   40);

  -- projects
  insert into public.projects (company_id, name, status, budget, due_date, created_by)
  values
    (c1, 'Voltage Mobile App', 'in_progress', 38000, '2026-10-15', demo_user),
    (c1, 'Atlas Data Migration', 'on_hold',   22000, '2026-11-01', demo_user);

  -- invoices
  insert into public.invoices (id, company_id, number, status, total, currency, created_by)
  values
    (inv1, c1, '2026-013', 'paid', 24000, 'USD', demo_user);

  insert into public.invoice_items (invoice_id, description, quantity, unit_price)
  values
    (inv1, 'Annual subscription', 1, 24000);

  -- expenses
  insert into public.expenses (company_id, category, vendor, amount, spent_at, created_by)
  values
    (c1, 'marketing', 'Google Ads', 2400, current_date - 7, demo_user),
    (c1, 'hosting',   'AWS',        1180, current_date - 5, demo_user),
    (c1, 'software',  'Linear',       96, current_date - 3, demo_user),
    (c1, 'payroll',   'Payroll · June', 18900, current_date - 1, demo_user);
end $$;
