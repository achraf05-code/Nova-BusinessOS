"use client";
import Link from "next/link";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./motion";

type Cycle = "monthly" | "annual";

interface Tier {
  name: string;
  description: string;
  monthly: number;
  annual: number;
  cta: string;
  href: string;
  highlight: boolean;
  features: string[];
  badge?: string;
}

const TIERS: Tier[] = [
  {
    name: "Starter",
    description: "For small teams getting their operations off spreadsheets.",
    monthly: 0,
    annual: 0,
    cta: "Start free",
    href: "/register",
    highlight: false,
    features: [
      "Up to 5 team members",
      "100 contacts · 20 projects",
      "AI CFO weekly digest",
      "Branded invoice PDFs",
      "CSV exports",
      "Email + community support",
    ],
  },
  {
    name: "Business",
    description: "For growing companies running real revenue, expenses & pipeline.",
    monthly: 49,
    annual: 39,
    cta: "Start 14-day trial",
    href: "/register?plan=business",
    highlight: true,
    badge: "Most popular",
    features: [
      "Up to 25 team members",
      "2,000 contacts · unlimited projects",
      "Unlimited invoices · auto-emails · dunning",
      "AI CFO real-time briefings",
      "Excel + PDF reports",
      "Priority email + chat support",
    ],
  },
  {
    name: "Enterprise",
    description: "For multi-entity organizations needing governance and SLAs.",
    monthly: 149,
    annual: 119,
    cta: "Talk to sales",
    href: "/contact",
    highlight: false,
    features: [
      "Unlimited team members",
      "Unlimited contacts · projects",
      "Multiple companies per workspace",
      "Advanced RBAC + audit log",
      "Custom data residency",
      "Dedicated CSM · 99.95% SLA",
      "SSO & SCIM (early access)",
    ],
  },
];

export default function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("annual");

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-24 dark:bg-gray-950"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[640px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Pricing
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, predictable, per-company.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            Start free, upgrade when your team grows. No per-seat surprises,
            no annual lock-in.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
            {(["monthly", "annual"] as Cycle[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  cycle === c
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                {cycle === c && (
                  <motion.span
                    layoutId="cycle-pill"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 28,
                    }}
                    className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-brand-500 to-theme-purple-500"
                  />
                )}
                <span className="relative">
                  {c === "monthly" ? "Monthly" : "Annual"}
                  {c === "annual" && (
                    <span className="ml-1 text-[10px] font-semibold uppercase opacity-80">
                      −20%
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier, idx) => (
            <Reveal key={tier.name} delay={0.05 * idx}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className={`relative h-full overflow-hidden rounded-2xl border p-7 transition ${
                  tier.highlight
                    ? "border-brand-500 bg-gradient-to-b from-brand-50/80 to-white shadow-theme-xl dark:border-brand-500/60 dark:from-brand-500/10 dark:to-gray-950"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                }`}
              >
                {tier.badge && (
                  <span className="absolute right-6 top-6 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-theme-md">
                    {tier.badge}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tier.name}
                </h3>
                <p className="mt-1 min-h-[40px] text-sm text-gray-500 dark:text-gray-400">
                  {tier.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    ${cycle === "monthly" ? tier.monthly : tier.annual}
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={cycle}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      / company / {cycle === "monthly" ? "month" : "month, billed annually"}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                        <Check />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition ${
                    tier.highlight
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
            All plans include unlimited workspaces, dark mode, audit logs and
            SOC 2-ready architecture. 14-day money-back guarantee on Business.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Check() {
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
