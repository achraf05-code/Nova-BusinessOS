"use client";
import React from "react";
import { motion } from "framer-motion";
import { Reveal } from "./motion";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatarColor: string;
  metric?: string;
}

const ITEMS: Testimonial[] = [
  {
    quote:
      "We replaced HubSpot, Notion and a spreadsheet of receipts with Nova in a single afternoon. Our finance lead loves the AI CFO digest — every Monday we know exactly where we stand.",
    name: "Léa Rousseau",
    role: "COO",
    company: "Voltage Studio",
    avatarColor: "from-brand-500 to-theme-purple-500",
    metric: "$32k saved · year 1",
  },
  {
    quote:
      "Pipeline-to-cash visibility is what we always wanted. Knowing live MRR while we close deals changed how we forecast — and how we sleep.",
    name: "Daniel Park",
    role: "Founder",
    company: "Northwind Labs",
    avatarColor: "from-success-500 to-blue-light-500",
    metric: "MRR forecast accuracy +40%",
  },
  {
    quote:
      "Multi-company support is a killer feature for a holding like ours. Strict data isolation, one login, AI CFO per workspace. Exactly what we&apos;ve been missing.",
    name: "Hiroshi Tanaka",
    role: "Managing Partner",
    company: "Atlas Capital",
    avatarColor: "from-warning-500 to-error-500",
    metric: "4 companies · 1 platform",
  },
  {
    quote:
      "I&apos;m a solo consultant. Nova replaced FreshBooks, Trello and a folder of receipts. Setup took 12 minutes. I&apos;ve invoiced $48k through it since.",
    name: "Marina Costa",
    role: "Independent Consultant",
    company: "Helios Advisory",
    avatarColor: "from-blue-light-500 to-brand-500",
    metric: "Setup time · 12 min",
  },
  {
    quote:
      "We onboarded the agency in a week. Drag-and-drop pipeline, branded invoices, automated dunning — clients pay 9 days faster. The AI CFO catches things I&apos;d miss.",
    name: "Jordan Smith",
    role: "Agency Owner",
    company: "Quanta Studio",
    avatarColor: "from-theme-purple-500 to-brand-500",
    metric: "Days-to-paid · -9",
  },
  {
    quote:
      "Three locations, twelve employees, one truth. Switching from QuickBooks + Asana + Pipedrive felt scary; we hit ROI in week three.",
    name: "Sofia Mendes",
    role: "Small Business Owner",
    company: "Mendes & Co.",
    avatarColor: "from-error-500 to-warning-500",
    metric: "ROI · 21 days",
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-gray-50 py-24 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
            Loved by operators
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Built for the people who run companies.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            From solo consultants to multi-entity holdings — same operating
            system, different scale.
          </p>
        </Reveal>

        <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {ITEMS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className="mb-5 break-inside-avoid rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="mb-3 flex items-center gap-1 text-warning-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} />
                ))}
              </div>
              <blockquote
                className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: `&ldquo;${t.quote}&rdquo;` }}
              />
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarColor} text-sm font-semibold text-white`}
                >
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
                    {t.role} · {t.company}
                  </span>
                </span>
              </figcaption>
              {t.metric && (
                <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
                  <Bolt /> {t.metric}
                </div>
              )}
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function Bolt() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h7l-1 8 11-13h-7l1-7z" />
    </svg>
  );
}
