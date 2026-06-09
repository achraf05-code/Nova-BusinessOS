import React from "react";
import Link from "next/link";

export default function AiCfoSpotlight() {
  const insights = [
    {
      title: "Marketing spend +25%",
      body: "Pipeline grew 6% — recommend reallocating 15% of paid budget to outbound.",
      tone: "warning",
    },
    {
      title: "Revenue growth slowed",
      body: "MRR growth dropped from 11% to 4%. Drill into churn cohort by segment.",
      tone: "error",
    },
    {
      title: "CAC trending up",
      body: "Customer acquisition cost is up 18% vs last quarter. Consider tightening ICP.",
      tone: "info",
    },
  ];

  const TONES: Record<string, string> = {
    warning: "border-warning-200 bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300 dark:border-warning-500/30",
    error: "border-error-200 bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300 dark:border-error-500/30",
    info: "border-blue-light-200 bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/10 dark:text-blue-light-300 dark:border-blue-light-500/30",
  };

  return (
    <section className="relative overflow-hidden bg-gray-950 py-24 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(122,90,248,0.20),transparent),radial-gradient(50%_50%_at_50%_100%,rgba(70,95,255,0.18),transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Flagship feature
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Meet your{" "}
              <span className="bg-gradient-to-r from-brand-300 to-theme-purple-500 bg-clip-text text-transparent">
                AI CFO
              </span>
              .
            </h2>
            <p className="mt-5 max-w-xl text-base text-gray-300">
              Nova analyzes your revenue, expenses, clients, projects and growth
              continuously — generating recommendations, insights and forecasts
              that read like a real CFO wrote them.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="text-brand-400">✓</span> Weekly auto-generated
                financial reports stored historically
              </li>
              <li className="flex gap-3">
                <span className="text-brand-400">✓</span> Anomaly detection on
                revenue, expenses and CAC
              </li>
              <li className="flex gap-3">
                <span className="text-brand-400">✓</span> Forecasting tied to
                live pipeline and recurring invoices
              </li>
            </ul>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Get the AI CFO →
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {insights.map((i) => (
              <div
                key={i.title}
                className={`rounded-2xl border p-5 backdrop-blur ${TONES[i.tone]}`}
              >
                <p className="text-sm font-semibold">{i.title}</p>
                <p className="mt-1 text-sm opacity-90">{i.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
