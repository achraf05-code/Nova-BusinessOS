<div align="center">

# MaBusinessOS

**The AI-Powered Business Operating System.**
CRM, projects, invoicing, expenses, accounting and an always-on AI CFO — unified for modern teams.

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-635bff?logo=stripe)](https://stripe.com)
[![Status](https://img.shields.io/badge/status-beta-7a5af8)](#)

</div>

---

## Table of contents

- [Vision](#vision)
- [Why Nova](#why-nova)
- [Features](#features)
- [Screens](#screens)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Database](#database)
- [Multi-tenancy & security](#multi-tenancy--security)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Deployment to Vercel](#deployment-to-vercel)
- [Demo mode](#demo-mode)
- [Roadmap](#roadmap)
- [Project structure](#project-structure)
- [License](#license)

---

## Vision

Modern teams shouldn't need 12 SaaS tools to run a business. **MaBusinessOS** unifies CRM, projects, invoicing, expenses, accounting and an always-on AI CFO into a single, multi-tenant workspace — built for founders and operators who refuse to glue together a stack.

Our mission: give every team the operational leverage of a well-funded company, minus the integration tax.

## Why Nova

| Other tools | Nova |
| --- | --- |
| 5–10 separate SaaS products | One unified workspace |
| Manual data sync between tools | Single Postgres source of truth |
| Static dashboards | AI CFO that explains *why* the numbers moved |
| Per-seat pricing for everything | Per-company plans, no surprises |
| Vendor lock-in | Your data, your SQL, exportable anytime |

---

## Features

### 🧑‍💼 CRM
Contacts, deals and pipeline (Lead → Contacted → Meeting → Proposal → Won/Lost) with **drag-and-drop stage updates**, optimistic UI and rollback on failure. Activities, notes, search and filters out of the box.

### 📋 Projects
Project list **and** Kanban board (To do / In progress / In review / Done) with priorities, deadlines, assignees and budgets. Drag-to-update, full CRUD.

### 🧾 Invoicing
Quotes, invoices and payments. Statuses (Draft, Sent, Paid, Overdue, Cancelled), live tax calculation, line-item editor, **branded PDF export** and automated email-on-status-change to your linked CRM contact.

### 💸 Expenses
Receipt-friendly tracking. Categories (Marketing, Software, Hosting, Travel, Payroll, Operations…), drag-and-drop receipt upload (Supabase Storage with tenant-scoped policies), donut-chart breakdown.

### 📊 Accounting
P&L, revenue, expenses, profit and cash flow — automatically reconciled from invoices and expense entries via Postgres triggers.

### 🤖 AI CFO (flagship)
A deterministic analytics engine that watches revenue, expenses, deals and projects → emits a written executive briefing, typed insights, prioritized recommendations and forecasts (next-month revenue, monthly burn, runway). Reports are persisted historically and fanned out via email to opted-in members.

### 📈 Reports
Business reports with **CSV, Excel (xlsx) and PDF** exports. Pre-built Revenue Report, Expense Report and Profit & Loss generators.

### 👥 Team management
Secure invitation system (256-bit URL-safe tokens, 14-day expiry), pending/accepted lists, resend, cancel. Welcome emails on accept.

### 💳 Subscriptions & billing
Three plans (Starter / Business / Enterprise) wired through **Stripe Checkout** + **Customer Portal**. Webhook-driven reconciliation, usage limits enforced at write time (contacts / projects / users).

### 🔔 Notifications
In-app inbox with type filters, read-state filters, pagination and **per-user email preferences**. Auto-emitted on: invoice paid, invoice sent, task assigned, lead won, employee added, AI CFO insight.

### 👤 Customers portal
Roll-up view of CRM contacts with their invoices and payment history (paid / outstanding / overdue per customer).

### ⚙️ Workspace settings
Editable company profile, currency, timezone, contact details. Multi-workspace switcher in the header.

### 🛡️ Production hardening
Rate limiting on login, invitations and AI CFO. RBAC enforced at the action and SQL layer. Tenant-scoped audit log of every mutation. `/dashboard/system` admin page surfacing live integration health.

Everything is **fully responsive**, **dark-mode native**, and built on a single design system.

---

## Screens

```
/                        Marketing landing
/features /pricing /about /contact /blog
/login /register /forgot-password
/invite/[token]          Public invitation accept

/onboarding/company      First-run workspace setup

/dashboard               Live KPIs + charts
  ├─ /crm                Pipeline (drag-and-drop) + contacts
  ├─ /customers          CRM ↔ invoices roll-up
  ├─ /projects           Kanban board (drag-and-drop) + projects
  ├─ /invoices           Line-item editor + PDF + status workflow
  ├─ /expenses           Receipt upload + category breakdown
  ├─ /accounting         P&L + cash flow + charts
  ├─ /ai-cfo             Insights · recommendations · forecasts
  ├─ /reports            CSV / Excel / PDF exports
  ├─ /employees          Team directory
  ├─ /calendar           FullCalendar
  ├─ /notifications      Inbox + email prefs
  ├─ /activity           Notifications + tenant audit log
  ├─ /profile            Personal info + security
  ├─ /settings           Company profile
  ├─ /settings/team      Invitations + members
  ├─ /billing            Stripe-powered plan switcher
  └─ /system             Admin-only integration health
```

---

## Architecture

```
mabusinessos/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (marketing)/        # Public landing pages
│   │   ├── (auth)/             # Login / register / reset
│   │   ├── (auth-actions)/     # Sign-out + workspace switcher actions
│   │   ├── api/                # Edge & Node route handlers
│   │   │   ├── ai-cfo/generate
│   │   │   ├── auth/login      # Rate-limited login proxy
│   │   │   ├── expenses/receipt
│   │   │   └── stripe/webhook
│   │   ├── dashboard/          # Authenticated workspace
│   │   ├── invite/[token]/     # Public invitation flow
│   │   └── onboarding/         # First-run flow
│   ├── components/             # UI primitives + feature panes
│   ├── config/                 # Brand + sidebar configuration
│   ├── context/                # Theme + sidebar providers
│   ├── icons/                  # SVG icon set (svgr-loaded)
│   ├── layout/                 # Dashboard shell
│   ├── lib/
│   │   ├── supabase/           # Browser / server / middleware clients
│   │   ├── email/              # Provider-agnostic transactional emails
│   │   ├── tenant.ts           # Active company + RBAC helpers
│   │   ├── usage.ts            # Plan limit enforcement
│   │   ├── stripe.ts           # Stripe client factory
│   │   ├── rateLimit.ts        # Token-bucket rate limiter
│   │   ├── aiCfo.ts            # AI CFO analytics engine
│   │   ├── invoicePdf.ts       # Branded invoice PDF generator
│   │   ├── reportPdf.ts        # Revenue / Expense / P&L PDFs
│   │   ├── excel.ts            # xlsx exports
│   │   ├── queries.ts          # Server-side data access
│   │   ├── activity.ts         # Audit log + notifications
│   │   ├── actions.ts          # Server-action wrapper (auth + RBAC)
│   │   ├── validation.ts       # Zod schemas
│   │   └── demoStore.ts        # In-memory store for demo mode
│   ├── types/database.ts       # Hand-curated Supabase types
│   ├── env.d.ts                # Typed process.env
│   └── middleware.ts           # Auth refresh + protected routes
├── supabase/
│   ├── supabase_schema.sql     # Production schema · enums · RLS · triggers
│   └── seed.sql                # Sample seed for local dev
├── next.config.ts              # Optimized for Vercel
├── vercel.json                 # Function timeouts + region
└── tsconfig.json               # Strict + forceConsistentCasing
```

### Multi-tenant model

Every business resource is scoped by `company_id`. A user can own one or many companies, identified through the `company_members` join table. Postgres **Row Level Security** is enabled on every table with two helpers (`is_company_member`, `has_company_role`) so application code stays focused on UX, not access control.

The active company is stored in a `nova_company_id` cookie and resolved on every server render through `getActiveCompany()`.

### AI CFO

`src/lib/aiCfo.ts` is a **fully deterministic** analytics engine. It reads invoices, expenses, deals and projects and returns a one-paragraph executive summary, typed insights (positive / warning / negative / neutral), prioritized recommendations (low / medium / high effort) and a forecast (next-month revenue + expenses, monthly burn, runway in months). Reports persist in `ai_cfo_reports` so trends can be reviewed historically. An LLM-powered narrative can be plugged in via `OPENAI_API_KEY`.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 15.2** (App Router · React 19 · RSC · Server Actions) |
| Language | **TypeScript 5** with `strict` + `forceConsistentCasingInFileNames` |
| Styling | **Tailwind CSS v4** + `tailwind-merge` + dark mode |
| Charts | **ApexCharts** via `react-apexcharts` |
| Calendar | **FullCalendar** |
| Forms | Native form actions + **Zod** schemas |
| Backend | **Supabase** (Postgres · Auth · Storage · `@supabase/ssr`) |
| Database | **Postgres** with RLS, triggers, indexes, citext, `jsonb` |
| Billing | **Stripe** (Checkout + Customer Portal + webhooks) |
| Email | **Resend** with provider-agnostic abstraction |
| Validation | **Zod** |
| Hosting | **Vercel** (Node functions for API routes + Edge middleware) |

---

## Database

The full schema is in [`supabase/supabase_schema.sql`](./supabase/supabase_schema.sql) — a single, idempotent migration containing:

- **18 tables** — `companies`, `company_members`, `projects`, `tasks`, `crm_contacts`, `crm_deals`, `crm_activities`, `invoices`, `invoice_items`, `expenses`, `financial_transactions`, `employees`, `ai_cfo_reports`, `notifications`, `activity_logs`, `team_invitations`, `subscriptions`, `notification_preferences`
- **11 enums** covering roles, project / task / lead / invoice / expense states, subscription plans + statuses, activity & notification kinds
- **Triggers** — `updated_at` on every mutable table, auto-add owner as `company_members.owner` on company create, auto-recompute invoice totals from line items, mirror paid invoices and expenses into a unified `financial_transactions` ledger
- **Indexes** on every `company_id` plus high-cardinality lookup paths
- **RLS policies** scoping every read/write to members of the company; storage policies for the `receipts` bucket
- **Helper view** `v_company_kpis`

```bash
psql "$DATABASE_URL" -f supabase/supabase_schema.sql
psql "$DATABASE_URL" -f supabase/seed.sql        # optional sample data
```

---

## Multi-tenancy & security

**Tenant safety**
- Every server action calls `requireActiveCompany()` and reads `ctx.company.id`. The `company_id` is **never** taken from the request body.
- Supabase writes are always scoped with `.eq("company_id", ctx.company.id)` — defense-in-depth even if RLS were misconfigured.
- Storage paths use `<company_id>/<user_id>/<file>`; bucket policies gate by the first folder segment.

**RBAC**
- Roles: `owner` · `admin` · `manager` · `employee`
- `withAction({ requiredRole: "admin" })` gates destructive / financial actions
- Symmetric SQL helpers: `has_company_role(company_id, roles[])`

**Production hardening**
- Token-bucket **rate limiting** on `/api/auth/login` (10 / 5 min / IP), `/api/ai-cfo/generate` (10 / 10 min / IP + 2 / 30 s / company), invitation actions (30 / hour / user)
- **Stripe webhook** signature verification with `STRIPE_WEBHOOK_SECRET`
- **Audit log** — every mutation writes an `activity_logs` row with actor, action, entity, metadata
- Baseline **HTTP security headers** (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)
- 256-bit invitation tokens (`crypto.getRandomValues`), unique-constraint enforced

---

## Quick start

> **Prereqs:** Node ≥ 20, npm ≥ 10. A Supabase project is recommended but optional — Nova boots in [demo mode](#demo-mode) without one.

```bash
git clone <your-fork>
cd mabusinessos
npm install --legacy-peer-deps
cp .env.example .env.local       # fill in real values
npm run dev                      # http://localhost:3000
```

That's it. The dashboard and marketing site work immediately. Sign up at `/register` (or land directly on `/dashboard` in demo mode), then click around.

---

## Environment variables

All variables are documented inline in [`.env.example`](./.env.example). At a glance:

| Variable | Required | Purpose |
| --- | :---: | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only (webhooks, admin client) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Production base URL (used in emails + OG) |
| `NEXT_PUBLIC_APP_NAME` | – | Display name override |
| `RESEND_API_KEY` | recommended | Transactional email (Invitations, invoices, AI CFO digest) |
| `EMAIL_FROM` | recommended | Sender, e.g. `MaBusinessOS <hello@yourdomain.com>` |
| `STRIPE_SECRET_KEY` | for paid plans | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | for paid plans | Verifies webhooks at `/api/stripe/webhook` |
| `STRIPE_PRICE_STARTER` / `_BUSINESS` / `_ENTERPRISE` | for paid plans | Stripe price IDs |
| `OPENAI_API_KEY` | – | Optional LLM augmentation for AI CFO |

Without Supabase, Stripe, or Resend keys, the app gracefully falls back to a built-in demo mode (see below).

---

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint (Next + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |

---

## Deployment to Vercel

Nova ships with a `vercel.json` and an optimized `next.config.ts`, so a one-click import from a Git repo works out of the box.

1. **Push** your fork to GitHub / GitLab / Bitbucket.
2. **Import** the repository at <https://vercel.com/new>.
3. **Set environment variables** (Production + Preview) per the table above. Use the values from [`.env.example`](./.env.example) as a checklist.
4. **Deploy**. Vercel auto-detects Next.js and uses:
   - `installCommand`: `npm install --legacy-peer-deps`
   - `buildCommand`: `next build`
   - Region: `iad1` (US East — change in `vercel.json` to taste)
5. **Apply the schema** to your Supabase project once:
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/supabase_schema.sql
   ```
6. **Configure Stripe webhooks** to point at `https://YOUR_DOMAIN/api/stripe/webhook`. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
7. **Configure Resend** — add your domain, set DKIM/SPF, copy the API key.

Vercel function timeouts are pre-configured (30s) for the Stripe webhook, AI CFO and receipt-upload routes — see `vercel.json`.

### What happens at build time

- 35 routes generated. Marketing pages prerender as static; every authenticated route is correctly marked **dynamic** (server-rendered on demand) so users always see fresh data.
- Server-only SDKs (`stripe`, `resend`, `@supabase/*`) are externalized so they never enter client / Edge bundles.
- ApexCharts, FullCalendar, Swiper and date-fns are tree-shaken via `experimental.optimizePackageImports`.

---

## Demo mode

When the Supabase, Stripe, or Resend env vars are absent, Nova activates **demo mode**:

- `lib/supabase/server.ts` returns a stub client; `lib/tenant.ts` returns a deterministic demo workspace
- `lib/queries.ts` reads from a process-wide in-memory store seeded with sample contacts, deals, projects, invoices, expenses, employees and notifications
- All write actions persist in the same store so create / edit / delete flows work end-to-end
- The Resend transport is replaced by an in-memory mailbox, visible from `/dashboard/system`
- The Stripe `Choose plan` button locally flips the subscription instead of redirecting

This lets you demo the full product on a fresh clone, run end-to-end smoke tests, and write CI without provisioning third-party accounts.

---

## Roadmap

### ✅ Shipped
- [x] Core multi-tenant SaaS (CRM, Projects, Invoices, Expenses, Accounting)
- [x] AI CFO engine (deterministic) + persisted reports
- [x] Drag-and-drop pipeline + Kanban with optimistic UI
- [x] Branded invoice PDF + receipt upload to Supabase Storage
- [x] Team invitations with secure tokens + email
- [x] Stripe Checkout, Customer Portal, webhooks, usage limits
- [x] Notification center with read-state and email preferences
- [x] Excel / PDF exports for reports

### 🚧 In progress
- [ ] LLM-augmented narrative for AI CFO (`OPENAI_API_KEY`)
- [ ] Email automation (dunning sequences, scheduled digests)
- [ ] Real-time collaboration via Supabase Realtime

### 🛣️ Future
- [ ] Public REST API + webhooks
- [ ] Zapier / Make integrations
- [ ] SSO (SAML) + SCIM provisioning
- [ ] Multi-currency FX engine
- [ ] Native mobile apps (iOS / Android)
- [ ] i18n
- [ ] E2E test suite (Playwright)

---

## Project structure

For an exhaustive sprint-by-sprint breakdown of what shipped, see:

- [`IMPLEMENTATION_REPORT.md`](./IMPLEMENTATION_REPORT.md) — Sprint 0 (foundation, branding, multi-tenancy, dashboard MVP)
- [`SPRINT1_IMPLEMENTATION_REPORT.md`](./SPRINT1_IMPLEMENTATION_REPORT.md) — production write-side workflows (CRUD, DnD, PDF, receipts)
- [`SPRINT2_IMPLEMENTATION_REPORT.md`](./SPRINT2_IMPLEMENTATION_REPORT.md) — beta-readiness (invitations, billing, email, exports, hardening)

---

## License

Proprietary. © MaBusinessOS. All rights reserved.

<sub>Logo & wordmark are part of the MaBusinessOS brand. Built with care on top of Next.js, Supabase and Stripe.</sub>
