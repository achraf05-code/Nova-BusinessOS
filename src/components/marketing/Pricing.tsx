import Link from "next/link";
import React from "react";
import { pricingTiers } from "@/config/nova";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-gray-50 py-20 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, predictable pricing.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            Start free, upgrade when your team grows. Per-company billing.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                tier.highlight
                  ? "border-brand-500 bg-white shadow-theme-lg dark:bg-gray-950"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {tier.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {tier.description}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  ${tier.price}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  /{tier.period}
                </span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-brand-500">✓</span>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
