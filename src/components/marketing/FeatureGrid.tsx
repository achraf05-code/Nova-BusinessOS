import React from "react";
import { moduleHighlights } from "@/config/nova";

const ICONS: Record<string, React.ReactNode> = {
  spark: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 14a4 4 0 1 0-8 0M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  kanban: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h6v16H4zM14 4h6v10h-6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  doc: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 13h6M9 17h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3v18h18M7 14l4-4 4 3 5-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wallet: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 12h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export default function FeatureGrid() {
  return (
    <section id="features" className="bg-white py-20 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Every module your business needs.
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
            Stop juggling tools. Nova ships every essential module out of the
            box — and they all share the same data, the same UI, and the same
            AI brain.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {moduleHighlights.map((m) => (
            <div
              key={m.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {ICONS[m.icon]}
              </div>
              <div className="mt-5 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {m.title}
                </h3>
                {"badge" in m && m.badge && (
                  <span className="inline-flex items-center rounded-full bg-theme-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-theme-purple-500">
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
