"use client";
import React from "react";
import { Reveal, Stagger, FadeUpItem } from "./motion";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Spark />,
    title: "AI CFO",
    description:
      "Always-on financial brain. Insights, recommendations, forecasts and runway — without hiring a CFO.",
    benefit: "Cut financial blind spots by 80% in week one.",
    accent: "from-brand-500/20 to-theme-purple-500/10",
  },
  {
    icon: <Users />,
    title: "CRM",
    description:
      "Pipeline, contacts, deals and activities — drag-and-drop, optimistic UI, rolls up by customer.",
    benefit: "Win 3-4 more deals per quarter with cleaner pipeline.",
    accent: "from-brand-500/15 to-blue-light-500/10",
  },
  {
    icon: <Kanban />,
    title: "Projects",
    description:
      "Kanban + project list with priorities, deadlines, assignees and budgets — connected to revenue.",
    benefit: "Ship 25% faster — no more status meetings.",
    accent: "from-warning-500/15 to-warning-500/5",
  },
  {
    icon: <Doc />,
    title: "Invoicing",
    description:
      "Quotes, invoices, line items, taxes and branded PDFs. Auto-emails on every status change.",
    benefit: "Get paid 11 days faster on average.",
    accent: "from-success-500/15 to-success-500/5",
  },
  {
    icon: <Wallet />,
    title: "Expenses",
    description:
      "Drag-and-drop receipts to Storage, categorize spend, watch your P&L update in real time.",
    benefit: "Reclaim 6 hours per month on bookkeeping.",
    accent: "from-error-500/10 to-warning-500/5",
  },
  {
    icon: <Chart />,
    title: "Accounting",
    description:
      "Revenue, expenses, profit and cash flow auto-reconciled from invoices and expenses.",
    benefit: "Live P&L without ever opening a spreadsheet.",
    accent: "from-blue-light-500/15 to-brand-500/10",
  },
  {
    icon: <Bell />,
    title: "Notifications",
    description:
      "Inbox + email digests. Invoice paid, lead won, task assigned, AI insights — never miss a beat.",
    benefit: "Reduce reply latency to under 30 minutes.",
    accent: "from-theme-purple-500/15 to-brand-500/10",
  },
  {
    icon: <Team />,
    title: "Team & roles",
    description:
      "Secure invitations, four-tier RBAC, audit log and per-user notification preferences.",
    benefit: "Onboard a new hire in under five minutes.",
    accent: "from-brand-500/15 to-success-500/10",
  },
  {
    icon: <Card />,
    title: "Subscription billing",
    description:
      "Three plans wired through Stripe Checkout + Customer Portal. Usage limits enforced at write time.",
    benefit: "Monetize from day one with zero billing code.",
    accent: "from-warning-500/10 to-theme-purple-500/10",
  },
];

export default function FeatureGrid() {
  return (
    <section
      id="features"
      className="relative bg-white py-24 dark:bg-gray-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Why teams switch
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            One platform. Every operating muscle.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            Stop integrating, exporting, reconciling and re-keying. Nova ships
            every essential business module out of the box — and they all share
            the same database, UI and AI brain.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FadeUpItem key={f.title}>
              <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/40">
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.accent} opacity-0 blur-2xl transition group-hover:opacity-100`}
                />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {f.icon}
                </div>
                <h3 className="relative mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="relative mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {f.description}
                </p>
                <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
                  <Bolt /> {f.benefit}
                </p>
              </div>
            </FadeUpItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* icons */
const I = (children: React.ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    {children}
  </svg>
);
function Spark() {
  return I(
    <path
      d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2L12 3zM18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
      fill="currentColor"
    />
  );
}
function Users() {
  return I(
    <path
      d="M16 14a4 4 0 1 0-8 0M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function Kanban() {
  return I(
    <path
      d="M4 4h6v16H4zM14 4h6v10h-6z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  );
}
function Doc() {
  return I(
    <path
      d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 13h6M9 17h6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}
function Wallet() {
  return I(
    <path
      d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 12h2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  );
}
function Chart() {
  return I(
    <path
      d="M3 3v18h18M7 14l4-4 4 3 5-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function Bell() {
  return I(
    <path
      d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21h4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function Team() {
  return I(
    <path
      d="M2 21a8 8 0 0 1 16 0M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM18 7a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM18 21a6 6 0 0 1 6-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  );
}
function Card() {
  return I(
    <path
      d="M3 7h18M3 11h18M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  );
}
function Bolt() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h7l-1 8 11-13h-7l1-7z" />
    </svg>
  );
}
