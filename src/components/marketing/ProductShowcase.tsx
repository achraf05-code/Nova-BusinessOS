"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./motion";

type Module = "crm" | "projects" | "invoices" | "expenses" | "ai-cfo";

interface Tab {
  id: Module;
  label: string;
  tagline: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: "crm",
    label: "CRM",
    tagline: "Pipeline you can drag",
    description:
      "Contacts, deals and activities — opinionated for B2B teams that want to win more revenue with less tooling.",
  },
  {
    id: "projects",
    label: "Projects",
    tagline: "Kanban that ships",
    description:
      "Drag tasks across To-do, In-progress, Review, Done. Priorities, assignees, deadlines — tied directly to revenue.",
  },
  {
    id: "invoices",
    label: "Invoices",
    tagline: "Get paid faster",
    description:
      "Quotes, invoices, line items, taxes, and branded PDFs. Auto-emails on every status change.",
  },
  {
    id: "expenses",
    label: "Expenses",
    tagline: "Receipts on autopilot",
    description:
      "Drag-and-drop receipts into Supabase Storage, categorize spend, see breakdowns by vendor and category.",
  },
  {
    id: "ai-cfo",
    label: "AI CFO",
    tagline: "Your numbers, explained",
    description:
      "Always-on financial brain that surfaces insights, recommendations, runway and forecasts the moment numbers move.",
  },
];

export default function ProductShowcase() {
  const [active, setActive] = useState<Module>("crm");

  return (
    <section
      id="product"
      className="relative overflow-hidden bg-white py-24 dark:bg-gray-950"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Product
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Five modules. One source of truth.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            Switch tabs to explore how every module connects to the same live
            data. No CSV exports. No Zapier glue. No drift.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto inline-flex min-w-full justify-center gap-2 sm:gap-3">
              {TABS.map((tab) => {
                const on = tab.id === active;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      on
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="showcase-pill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-brand-500 to-theme-purple-500"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2} className="mt-10">
          <div className="grid items-start gap-8 lg:grid-cols-[360px,1fr]">
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                    {TABS.find((t) => t.id === active)?.label}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
                    {TABS.find((t) => t.id === active)?.tagline}
                  </h3>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    {TABS.find((t) => t.id === active)?.description}
                  </p>
                  <ul className="mt-5 space-y-2.5 text-sm">
                    {moduleHighlights[active].map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                          <CheckIcon />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-r from-brand-500/20 via-theme-purple-500/15 to-transparent blur-2xl"
              />
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
                  <span className="h-2.5 w-2.5 rounded-full bg-error-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success-400" />
                  <span className="ml-3 text-[11px] text-gray-500">
                    nova-businessos.com / dashboard / {active}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                    className="min-h-[340px] p-5 sm:p-6"
                  >
                    {active === "crm" && <CrmMock />}
                    {active === "projects" && <ProjectsMock />}
                    {active === "invoices" && <InvoicesMock />}
                    {active === "expenses" && <ExpensesMock />}
                    {active === "ai-cfo" && <AiCfoMock />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const moduleHighlights: Record<Module, string[]> = {
  crm: [
    "Drag-and-drop pipeline with optimistic UI and rollback",
    "Activities, notes, search and filters out of the box",
    "Customer roll-up: every contact ↔ invoices ↔ payment history",
  ],
  projects: [
    "Kanban + project list views",
    "Priorities · deadlines · assignees · budget",
    "Tasks linked to deals → invoices → revenue",
  ],
  invoices: [
    "Multi-line item editor with live tax + total",
    "Branded PDFs, status workflow (Draft → Paid)",
    "Auto-emails on every status change",
  ],
  expenses: [
    "Drag-and-drop receipts to Supabase Storage",
    "Donut breakdown by category and vendor",
    "Auto-reconciled into your P&L and cash flow",
  ],
  "ai-cfo": [
    "Executive briefing summarizing the period",
    "Typed insights · prioritized recommendations",
    "Forecasts: next-month revenue, monthly burn, runway",
  ],
};

/* --------------------------------------------------------------------- */
/* Module mocks                                                          */
/* --------------------------------------------------------------------- */

function CrmMock() {
  const stages = [
    { name: "Lead", color: "bg-gray-400", deals: ["Helios Dashboard · $9.3k"] },
    {
      name: "Meeting",
      color: "bg-warning-500",
      deals: ["Northwind · $7.8k", "Atlas Pilot · $60k"],
    },
    {
      name: "Proposal",
      color: "bg-theme-purple-500",
      deals: ["Acme Redesign · $14.2k"],
    },
    {
      name: "Won",
      color: "bg-success-500",
      deals: ["Voltage Annual · $24k", "Quanta Migration · $18.4k"],
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stages.map((s) => (
        <div
          key={s.name}
          className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.02]"
        >
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {s.name}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {s.deals.map((d) => (
              <div
                key={d}
                className="cursor-grab rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-medium text-gray-800 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsMock() {
  const cols = [
    { name: "To do", items: ["Draft proposal · Acme", "Reconcile expenses"] },
    {
      name: "In progress",
      items: ["Wireframe Voltage screens", "Launch retargeting"],
    },
    { name: "In review", items: ["Send invoice #2026-014"] },
    { name: "Done", items: ["Onboard new employee"] },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cols.map((c) => (
        <div
          key={c.name}
          className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.02]"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            {c.name}
          </p>
          <div className="mt-2 space-y-1.5">
            {c.items.map((t) => (
              <div
                key={t}
                className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-800 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function InvoicesMock() {
  const items = [
    { d: "Strategy workshop", q: 1, p: 4500 },
    { d: "Brand identity sprint", q: 1, p: 9000 },
    { d: "Implementation support · 8h", q: 8, p: 220 },
  ];
  const subtotal = items.reduce((s, i) => s + i.q * i.p, 0);
  const tax = +(subtotal * 0.09).toFixed(2);
  const total = subtotal + tax;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Invoice 2026-018
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            Acme Inc.
          </p>
        </div>
        <span className="rounded-full border border-warning-200 bg-warning-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-warning-700 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-300">
          Sent
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.03]">
            <tr>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((it) => (
              <tr key={it.d} className="text-gray-700 dark:text-gray-300">
                <td className="px-3 py-2">{it.d}</td>
                <td className="px-3 py-2 text-right">{it.q}</td>
                <td className="px-3 py-2 text-right">${it.p.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">
                  ${(it.q * it.p).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ml-auto w-full max-w-[220px] space-y-1 text-xs">
        <Row label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
        <Row label="Tax (9%)" value={`$${tax.toLocaleString()}`} />
        <Row label="Total" value={`$${total.toLocaleString()}`} bold />
      </div>
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={`text-gray-800 dark:text-white ${bold ? "text-sm font-semibold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function ExpensesMock() {
  const cats = [
    { name: "Marketing", value: 32, color: "#465fff" },
    { name: "Software", value: 18, color: "#7a5af8" },
    { name: "Hosting", value: 12, color: "#fb6514" },
    { name: "Travel", value: 8, color: "#12b76a" },
    { name: "Payroll", value: 30, color: "#0ba5ec" },
  ];
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[180px,1fr]">
      <Donut data={cats} />
      <ul className="space-y-2">
        {cats.map((c) => (
          <li
            key={c.name}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: c.color }}
              />
              {c.name}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {c.value}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Donut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-40 w-40">
      {data.map((d) => {
        const dash = (d.value / total) * circumference;
        const el = (
          <motion.circle
            key={d.name}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth="14"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          />
        );
        offset += dash;
        return el;
      })}
      <text
        x="50"
        y="46"
        textAnchor="middle"
        className="fill-gray-500 text-[6px] font-semibold uppercase"
      >
        Spend
      </text>
      <text
        x="50"
        y="58"
        textAnchor="middle"
        className="fill-gray-900 text-[10px] font-semibold dark:fill-white"
      >
        $23,940
      </text>
    </svg>
  );
}

function AiCfoMock() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4 dark:border-brand-500/30 dark:from-brand-500/10 dark:to-gray-900">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Executive briefing
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white">
          You&apos;re profitable with $148.2k in revenue and $105.6k in expenses.
          Pipeline holds $91.3k. <strong>Runway: 14 months.</strong>
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Insight
          tone="warning"
          title="Marketing share +25%"
          body="Reallocate 15% to outbound for two cycles."
        />
        <Insight
          tone="success"
          title="Win rate at 58%"
          body="Above your historical baseline of 41%."
        />
        <Insight
          tone="info"
          title="CAC trending up"
          body="$840 → $1,020 vs last quarter. Tighten ICP."
        />
        <Insight
          tone="negative"
          title="2 invoices overdue"
          body="$13.5k. Trigger automated follow-up."
        />
      </div>
    </div>
  );
}
function Insight({
  tone,
  title,
  body,
}: {
  tone: "warning" | "success" | "info" | "negative";
  title: string;
  body: string;
}) {
  const map: Record<string, string> = {
    warning:
      "border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-200",
    success:
      "border-success-200 bg-success-50 text-success-800 dark:border-success-500/40 dark:bg-success-500/10 dark:text-success-200",
    info: "border-blue-light-200 bg-blue-light-50 text-blue-light-800 dark:border-blue-light-500/40 dark:bg-blue-light-500/10 dark:text-blue-light-200",
    negative:
      "border-error-200 bg-error-50 text-error-800 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-200",
  };
  return (
    <div className={`rounded-xl border p-3 text-xs ${map[tone]}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 opacity-90">{body}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6.5L5 9l4.5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
