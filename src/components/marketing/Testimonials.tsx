import React from "react";

const items = [
  {
    quote:
      "We replaced HubSpot, Notion and a spreadsheet of receipts with Nova in a single afternoon. Our finance lead loves the AI CFO digest.",
    name: "Léa Rousseau",
    role: "COO, Voltage Studio",
  },
  {
    quote:
      "The pipeline-to-cash visibility is what we always wanted. Knowing live MRR while we close deals changed how we forecast.",
    name: "Daniel Park",
    role: "Founder, Northwind Labs",
  },
  {
    quote:
      "Multi-company support is a killer feature for a holding like ours. Strict data isolation, one login.",
    name: "Hiroshi Tanaka",
    role: "Managing Partner, Atlas Capital",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-20 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by operators.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            From solo founders to multi-entity holdings.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <blockquote className="grow text-sm text-gray-700 dark:text-gray-300">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {t.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="text-sm">
                  <span className="block font-semibold text-gray-900 dark:text-white">
                    {t.name}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
