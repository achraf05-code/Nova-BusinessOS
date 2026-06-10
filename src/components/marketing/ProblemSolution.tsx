"use client";
import React from "react";
import { Reveal } from "./motion";

const PROBLEMS = [
  {
    icon: "🧩",
    title: "12 disconnected SaaS tools",
    body: "Sales lives in HubSpot, finance in QuickBooks, projects in Asana, files in Drive. Nothing reconciles.",
  },
  {
    icon: "📥",
    title: "Lost invoices and missed payments",
    body: "PDFs in inboxes, status tracked in spreadsheets, dunning happens in someone&apos;s head.",
  },
  {
    icon: "🤐",
    title: "Poor team collaboration",
    body: "Hand-offs slip between tools. The same task lives in three places. Nobody owns the truth.",
  },
  {
    icon: "🔍",
    title: "Zero financial visibility",
    body: "P&L lags by 6 weeks. Cash position is a guess. Decisions wait for the bookkeeper to update the workbook.",
  },
  {
    icon: "🐢",
    title: "Slow operations",
    body: "Onboarding a new hire takes a week. Closing a month takes another. Growth is choked by overhead.",
  },
];

const SOLUTIONS = [
  {
    icon: <Bolt />,
    title: "One unified workspace",
    body: "Every record — contacts, deals, projects, invoices, expenses, employees — shares one tenant-isolated database.",
  },
  {
    icon: <Auto />,
    title: "Automated invoicing & dunning",
    body: "Status flips trigger emails to clients. Mark paid → revenue updates → AI CFO recalculates margin.",
  },
  {
    icon: <Sync />,
    title: "Real collaboration",
    body: "Shared pipeline, kanban, audit log and notification center. Everyone sees the same truth, instantly.",
  },
  {
    icon: <Eye />,
    title: "Live financials",
    body: "P&L, cash flow and runway recompute on every change. The AI CFO writes the explanation.",
  },
  {
    icon: <Speed />,
    title: "Operational velocity",
    body: "Onboard in 5 minutes. Close a month in an hour. Spend the rest of your time growing.",
  },
];

export default function ProblemSolution() {
  return (
    <section className="relative bg-gray-50 py-24 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
            The before & after
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            From operational chaos to <span className="text-brand-500">one source of truth</span>.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            Most SMEs ship glue code between SaaS tools just to keep the wheels
            on. Nova replaces the glue with one platform.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-2xl border border-error-200 bg-white p-7 dark:border-error-500/30 dark:bg-gray-950">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-error-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-error-700 dark:bg-error-500/15 dark:text-error-300">
                  Without Nova
                </span>
                <span className="text-xs text-gray-500">5 daily problems</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                The 12-tool tax
              </h3>
              <ul className="mt-6 space-y-4">
                {PROBLEMS.map((p) => (
                  <li
                    key={p.title}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.02]"
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {p.title}
                      </p>
                      <p
                        className="mt-1 text-xs text-gray-600 dark:text-gray-400"
                        dangerouslySetInnerHTML={{ __html: p.body }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-success-200 bg-white p-7 dark:border-success-500/30 dark:bg-gray-950">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-success-500/10 blur-3xl"
              />
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success-700 dark:bg-success-500/15 dark:text-success-300">
                  With Nova
                </span>
                <span className="text-xs text-gray-500">5 instant wins</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                One operating system
              </h3>
              <ul className="mt-6 space-y-4">
                {SOLUTIONS.map((s) => (
                  <li
                    key={s.title}
                    className="flex items-start gap-3 rounded-xl border border-success-100 bg-success-50/40 p-3 dark:border-success-500/20 dark:bg-success-500/5"
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-500/15 text-success-600 dark:text-success-300">
                      {s.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {s.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const Sw = (children: React.ReactNode) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    {children}
  </svg>
);
function Bolt() {
  return Sw(<path d="M13 2L3 14h7l-1 8 11-13h-7l1-7z" fill="currentColor" />);
}
function Auto() {
  return Sw(
    <path
      d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function Sync() {
  return Sw(
    <path
      d="M16 4l4 4-4 4M4 12a8 8 0 0 1 14-5.3M8 20l-4-4 4-4M20 12a8 8 0 0 1-14 5.3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function Eye() {
  return Sw(
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function Speed() {
  return Sw(
    <path
      d="M21 12a9 9 0 1 1-9-9M12 12l5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
