"use client";
import React from "react";
import { motion } from "framer-motion";
import { Reveal } from "./motion";

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  body: string;
  decimals?: number;
}

const STATS: Stat[] = [
  {
    prefix: "",
    value: 14,
    suffix: " hrs",
    label: "Saved per week",
    body: "Across CRM, invoicing, expense entry and reporting. That&apos;s a third of a full-time admin role.",
  },
  {
    prefix: "$",
    value: 2400,
    suffix: "/mo",
    label: "Tooling cost cut",
    body: "Replaces ~12 SaaS subscriptions for an average 15-person team.",
  },
  {
    prefix: "+",
    value: 32,
    suffix: "%",
    label: "Productivity gain",
    body: "Measured by work-throughput per employee in the first 60 days.",
  },
  {
    prefix: "",
    value: 11,
    suffix: " days",
    label: "Faster invoicing",
    body: "Average days-to-paid drops from 38 to 27 with auto-emails and dunning.",
  },
];

function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span>
      {prefix}
      {decimals > 0
        ? n.toFixed(decimals)
        : Math.round(n).toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

export default function Roi() {
  return (
    <section className="relative bg-white py-24 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            ROI in 30 days
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Numbers our customers report.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            Median across 120 small teams that switched to Nova in 2026.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={0.05 * i}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-900"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl"
                />
                <p className="relative text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  <Counter
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                  />
                </p>
                <p className="relative mt-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {s.label}
                </p>
                <p
                  className="relative mt-3 text-xs text-gray-500 dark:text-gray-400"
                  dangerouslySetInnerHTML={{ __html: s.body }}
                />
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-gray-200 bg-gradient-to-r from-brand-50 to-white p-6 dark:border-gray-800 dark:from-brand-500/10 dark:to-gray-900">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">
                Better decisions, faster.
              </strong>{" "}
              Customers using AI CFO weekly reduce decision-making latency
              from 8 days to under 24 hours — measured from data event to
              committed action.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
