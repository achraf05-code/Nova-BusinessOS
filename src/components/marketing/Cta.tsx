import Link from "next/link";
import React from "react";

export default function Cta() {
  return (
    <section className="bg-white py-20 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-theme-purple-500 px-6 py-16 text-center text-white sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Run your business, not your tooling.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/85 sm:text-base">
            Nova BusinessOS gives you CRM, projects, invoices, expenses,
            accounting and an AI CFO in one place. Try it free today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-gray-50"
            >
              Start free
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
