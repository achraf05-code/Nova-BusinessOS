import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-500/10 dark:via-gray-950 dark:to-gray-950"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/20"
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur dark:border-brand-500/30 dark:bg-white/5 dark:text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            New · AI CFO is live
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Manage your business from{" "}
            <span className="bg-gradient-to-r from-brand-500 to-theme-purple-500 bg-clip-text text-transparent">
              one platform
            </span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            Nova BusinessOS unifies CRM, projects, invoicing, expenses,
            accounting and an always-on AI CFO assistant — purpose-built for
            modern teams who refuse to glue 12 SaaS tools together.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-theme-md transition hover:bg-brand-600"
            >
              Start free — no card required
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              See features →
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            14-day Growth trial · Cancel anytime · Built on Supabase
          </p>
        </div>

        {/* product mock */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
              <span className="h-2.5 w-2.5 rounded-full bg-error-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-success-400" />
              <span className="ml-3 text-xs text-gray-500">
                nova-businessos.com / dashboard
              </span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              {[
                { label: "Revenue", value: "$148,200", trend: "+12.4%" },
                { label: "Active deals", value: "37", trend: "+5 this week" },
                { label: "Profit", value: "$42,580", trend: "+8.1%" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs text-success-600">{kpi.trend}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-brand-50 to-white p-5 dark:border-gray-800 dark:from-brand-500/10 dark:to-gray-900">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  AI CFO insight
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                  Marketing spend is up <strong>25%</strong> vs last month while
                  pipeline grew only 6%. Consider rebalancing budget toward
                  outbound — projected ROI <strong>+18%</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
