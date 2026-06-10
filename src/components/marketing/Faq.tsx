"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./motion";

const FAQS = [
  {
    q: "How is my data isolated from other companies?",
    a: "Every business record carries a `company_id` and is gated by Postgres Row Level Security policies. Even our application code can&apos;t cross tenant boundaries — it&apos;s enforced at the database layer. Storage receipts are scoped by the same boundary.",
  },
  {
    q: "What does a workspace cost?",
    a: "Starter is free forever for teams up to 5. Business is $39 / company / month billed annually (or $49 monthly). Enterprise starts at $119 / company / month with custom terms. We charge per company, not per seat — invite as many teammates as your plan allows.",
  },
  {
    q: "Can I migrate from QuickBooks, HubSpot or Asana?",
    a: "Yes. We support CSV import for contacts, deals, projects, invoices and expenses today. Native importers for QuickBooks, HubSpot and Asana are on the Q3 roadmap. Our success team can help with the first migration on Business and Enterprise.",
  },
  {
    q: "What kind of support do I get?",
    a: "Starter: email + community. Business: priority email + chat with a typical 2-hour response in business hours. Enterprise: dedicated success manager, 99.95% SLA and quarterly business reviews.",
  },
  {
    q: "Which integrations are live today?",
    a: "Stripe (billing), Supabase (data + auth), Resend (transactional email). Gmail, Outlook, Slack, WhatsApp, Google Calendar, Zapier and Notion are in development. A public REST API + webhooks are on the roadmap.",
  },
  {
    q: "How does the AI CFO work?",
    a: "It&apos;s a deterministic analytics engine that reads your invoices, expenses, deals and projects, then writes an executive briefing, typed insights, recommendations and forecasts (including runway). Reports are persisted historically so you can review trends. An optional LLM augmentation enriches the narrative when OPENAI_API_KEY is set.",
  },
  {
    q: "Is Nova GDPR compliant?",
    a: "Yes. We&apos;re GDPR-aligned: data minimization, export anytime, deletion on request, and EU data residency available on Enterprise. Our DPA is provided to all paying customers on request.",
  },
  {
    q: "Can I run multiple companies under one account?",
    a: "Absolutely — that&apos;s a first-class feature. Switch between workspaces from the header dropdown. Each company is its own tenant: separate data, RLS, AI CFO and audit log. Common with holdings, agencies and consultants.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative bg-white py-24 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Common questions, answered.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={faq.q}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white transition dark:border-gray-800 dark:bg-gray-900"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open === i}
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {faq.q}
                </span>
                <motion.svg
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-5 w-5 shrink-0 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                  >
                    <p
                      className="px-5 py-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: faq.a }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Still have questions?{" "}
            <a
              href="/contact"
              className="font-medium text-brand-500 hover:text-brand-600"
            >
              Talk to a human →
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
