"use client";
import React from "react";
import Link from "next/link";
import { Reveal } from "./motion";

export default function AiCfoSpotlight() {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-28 text-white">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(122,90,248,0.30),transparent_60%),radial-gradient(45%_45%_at_80%_100%,rgba(70,95,255,0.25),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4))]"
      />
      <Grid />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Flagship feature
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            Meet your{" "}
            <span className="bg-gradient-to-r from-brand-300 via-theme-purple-500 to-brand-400 bg-clip-text text-transparent">
              AI CFO
            </span>
            .
          </h2>
          <p className="mt-5 text-base text-gray-300 sm:text-lg">
            An always-on financial brain that watches revenue, expenses,
            clients and pipeline — and surfaces the recommendations a real CFO
            would write.
          </p>
        </Reveal>

        <div className="mt-16 grid items-stretch gap-10 lg:grid-cols-12">
          {/* Bullets + CTA */}
          <Reveal className="lg:col-span-5" delay={0.1}>
            <ul className="space-y-5 text-sm text-gray-300">
              <Bullet
                icon={<RevenueIcon />}
                title="Revenue insights"
                body="Trend, MRR shifts, paid vs outstanding, win rate against your historical baseline."
              />
              <Bullet
                icon={<ProfitIcon />}
                title="Profit analysis"
                body="Live margin, period-over-period comparison, expense category breakdown."
              />
              <Bullet
                icon={<RecIcon />}
                title="Business recommendations"
                body="Prioritized actions with effort tags — what to do, in what order, why."
              />
              <Bullet
                icon={<CashIcon />}
                title="Cash flow intelligence"
                body="Burn rate, runway in months, anomaly detection on inflows and outflows."
              />
            </ul>
            <Link
              href="/register"
              className="mt-10 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:bg-gray-100"
            >
              Get the AI CFO
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </Reveal>

          {/* Dashboard mock */}
          <Reveal className="lg:col-span-7" delay={0.15}>
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-[28px] bg-gradient-to-r from-brand-500/30 via-theme-purple-500/25 to-brand-500/20 blur-3xl"
              />
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                      Weekly briefing
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Voltage Studio · 6 Jun → 12 Jun 2026
                    </p>
                  </div>
                  <span className="rounded-full border border-success-500/30 bg-success-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-success-300">
                    Healthy
                  </span>
                </div>

                <p className="mt-5 text-sm text-gray-200">
                  You&apos;re profitable with{" "}
                  <strong className="text-white">$148.2k</strong> revenue and{" "}
                  <strong className="text-white">$105.6k</strong> expenses.
                  Pipeline holds <strong className="text-white">$91.3k</strong>.
                  Runway extended to{" "}
                  <strong className="text-success-300">14 months</strong>.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Stat label="Revenue" value="$148.2k" delta="+12.4%" up />
                  <Stat label="Expenses" value="$105.6k" delta="+8.1%" />
                  <Stat label="Margin" value="28.7%" delta="+3.1pp" up />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Card
                    accent="from-warning-500/20 to-warning-500/5 border-warning-500/30"
                    title="Marketing spend +25%"
                    body="Pipeline grew 6%. Reallocate 15% of paid budget to outbound."
                    effort="medium"
                  />
                  <Card
                    accent="from-success-500/20 to-success-500/5 border-success-500/30"
                    title="Win rate above baseline"
                    body="58% vs your historical 41%. Double down on current ICP."
                    effort="low"
                  />
                  <Card
                    accent="from-blue-light-500/20 to-blue-light-500/5 border-blue-light-500/30"
                    title="CAC trending up"
                    body="$840 → $1,020. Tighten ICP and prioritize warm channels."
                    effort="medium"
                  />
                  <Card
                    accent="from-error-500/20 to-error-500/5 border-error-500/30"
                    title="2 invoices overdue"
                    body="$13.5k aging. Trigger 3-step dunning sequence."
                    effort="low"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Bullet({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-300">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-gray-400">{body}</p>
      </div>
    </li>
  );
}

function Stat({
  label,
  value,
  delta,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  up?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      <p
        className={`mt-1 text-xs font-medium ${
          up ? "text-success-300" : "text-error-300"
        }`}
      >
        {delta}
      </p>
    </div>
  );
}

function Card({
  accent,
  title,
  body,
  effort,
}: {
  accent: string;
  title: string;
  body: string;
  effort: "low" | "medium" | "high";
}) {
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-4 ${accent}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
          {effort}
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-300">{body}</p>
    </div>
  );
}

function Grid() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-white/5"
    >
      <defs>
        <pattern
          id="cfo-grid"
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 56 0 L 0 0 0 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cfo-grid)" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 17l6-6 4 4 7-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ProfitIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v20M17 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function RecIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2L12 3zM18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
        fill="currentColor"
      />
    </svg>
  );
}
function CashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12c4-6 14-6 18 0M3 12c4 6 14 6 18 0M12 9v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
