"use client";
import Link from "next/link";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const LIVE_KPIS = [
  { label: "Revenue", value: "$148,200", trend: "+12.4%" },
  { label: "Active deals", value: "37", trend: "+5 this week" },
  { label: "Profit margin", value: "28.7%", trend: "+3.1pp" },
];

const LOGOS = [
  "VOLTAGE",
  "ATLAS",
  "NORTHWIND",
  "QUANTA",
  "HELIOS",
  "LUMEN",
  "OUTBOUND",
  "PARADIGM",
];

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-500/15 dark:via-gray-950 dark:to-gray-950"
      />
      <motion.div
        aria-hidden
        initial={{ scale: 0.9, opacity: 0 }}
        animate={
          reduce
            ? { opacity: 1 }
            : { scale: [0.9, 1.05, 0.95], opacity: 1 }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/30 via-theme-purple-500/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
      />
      <GridBackground />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur dark:border-brand-500/30 dark:bg-white/5 dark:text-brand-300"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
            </span>
            New · AI CFO is now live for every workspace
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
          >
            Run your entire company from{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-brand-500 via-theme-purple-500 to-brand-500 bg-clip-text text-transparent [background-size:200%_100%] [animation:gradient_8s_linear_infinite]">
                one AI-native platform
              </span>
              <svg
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 h-2 w-full text-brand-500/40"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 6 Q 50 0 100 4 T 198 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg"
          >
            Nova BusinessOS unifies CRM, projects, invoicing, expenses,
            accounting and an always-on AI CFO. Replace 12 disconnected SaaS
            tools with a single, multi-tenant workspace built for modern teams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-theme-lg transition hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-theme-xl"
            >
              <span className="relative z-10">Start free — no card required</span>
              <span
                aria-hidden
                className="absolute inset-0 -z-0 bg-gradient-to-r from-brand-500 via-theme-purple-500 to-brand-500 opacity-0 transition group-hover:opacity-100"
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="relative z-10 ml-2 transition-transform group-hover:translate-x-0.5"
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="#product"
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-gray-700 backdrop-blur transition hover:bg-white dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              <PlayIcon /> Watch the 90-second tour
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-5 text-xs text-gray-500 dark:text-gray-400"
          >
            14-day Business trial · Cancel anytime · Built on Supabase &
            Stripe · SOC 2-ready architecture
          </motion.p>
        </div>

        {/* Product mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-6 -inset-y-3 rounded-[28px] bg-gradient-to-r from-brand-500/20 via-theme-purple-500/20 to-brand-500/20 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
                <span className="h-2.5 w-2.5 rounded-full bg-error-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-success-400" />
                <span className="ml-3 inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] text-gray-500 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">
                  <LockIcon />
                  app.nova-businessos.com / dashboard
                </span>
              </div>
              {/* KPI strip */}
              <div className="grid gap-4 p-6 sm:grid-cols-3">
                {LIVE_KPIS.map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                    className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {kpi.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                      {kpi.value}
                    </p>
                    <p className="mt-1 text-xs text-success-600">{kpi.trend}</p>
                  </motion.div>
                ))}
              </div>
              {/* AI CFO insight */}
              <div className="px-6 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-5 dark:border-brand-500/30 dark:from-brand-500/10 dark:via-gray-900 dark:to-gray-900"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    <SparkIcon />
                    AI CFO insight · 2 minutes ago
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                    Marketing spend is up <strong>25%</strong> vs last month
                    while pipeline grew only 6%. Reallocate{" "}
                    <strong>15%</strong> to outbound — projected ROI{" "}
                    <strong className="text-success-600">+18%</strong>.
                  </p>
                </motion.div>
              </div>
              {/* Bottom row: revenue chart + pipeline */}
              <div className="grid gap-3 border-t border-gray-200 p-6 dark:border-gray-800 sm:grid-cols-3">
                <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Revenue · last 6 months
                  </p>
                  <MiniChart />
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Pipeline
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      { stage: "Lead", value: 9 },
                      { stage: "Meeting", value: 6 },
                      { stage: "Proposal", value: 4 },
                      { stage: "Won", value: 12 },
                    ].map((s) => (
                      <div key={s.stage} className="text-xs">
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                          <span>{s.stage}</span>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {s.value}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${s.value * 8}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-theme-purple-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -10 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="absolute -right-2 top-32 hidden w-[260px] rounded-xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 lg:block"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-500/10 text-success-600">
                  <DollarIcon />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Invoice 2026-013 paid
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Voltage Studio · $24,000
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating insight */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 10 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="absolute -left-3 bottom-24 hidden w-[230px] rounded-xl border border-theme-purple-500/30 bg-white p-3 shadow-theme-lg dark:bg-gray-900 lg:block"
            >
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-theme-purple-500">
                <SparkIcon /> AI CFO
              </div>
              <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                Runway extended to <strong>14 months</strong> at current burn.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Logo strip */}
        <div className="mx-auto mt-16 max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Trusted by operators at
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 lg:grid-cols-8">
            {LOGOS.map((l) => (
              <div
                key={l}
                className="text-center text-sm font-semibold tracking-widest text-gray-400 transition hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-300"
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </section>
  );
}

/* --------------------------- helpers --------------------------- */

function GridBackground() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-40 dark:opacity-30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="hero-grid"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 48 0 L 0 0 0 48"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
          />
        </pattern>
        <radialGradient id="hero-fade" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="80%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="hero-mask">
          <rect width="100%" height="100%" fill="url(#hero-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#hero-grid)"
        mask="url(#hero-mask)"
      />
    </svg>
  );
}

function MiniChart() {
  const data = [42, 55, 48, 60, 58, 78];
  const max = Math.max(...data);
  return (
    <svg viewBox="0 0 240 80" className="mt-3 w-full">
      <defs>
        <linearGradient id="rev-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#465fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#465fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {(() => {
        const points = data.map((v, i) => {
          const x = (i / (data.length - 1)) * 240;
          const y = 80 - (v / max) * 70;
          return `${x},${y}`;
        });
        const linePath = `M ${points.join(" L ")}`;
        const areaPath = `${linePath} L 240,80 L 0,80 Z`;
        return (
          <>
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              d={linePath}
              fill="none"
              stroke="#465fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <motion.path
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.2 }}
              d={areaPath}
              fill="url(#rev-area)"
            />
          </>
        );
      })()}
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.6 4.8L18 8l-4.4 1.2L12 14l-1.6-4.8L6 8l4.4-1.2L12 2zm6 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v20M17 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
