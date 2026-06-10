"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { Reveal } from "./motion";

export default function Cta() {
  return (
    <section className="relative bg-white py-24 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-20 text-center text-white sm:px-12">
            {/* Animated gradient backdrop */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0.6 }}
              animate={{
                opacity: [0.6, 0.85, 0.6],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(122,90,248,0.45),transparent),radial-gradient(60%_60%_at_50%_100%,rgba(70,95,255,0.45),transparent)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
              }}
            />

            {/* Floating orbs */}
            <motion.div
              aria-hidden
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="pointer-events-none absolute left-12 top-12 hidden h-3 w-3 rounded-full bg-brand-400/70 blur-[2px] sm:block"
            />
            <motion.div
              aria-hidden
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
              className="pointer-events-none absolute right-16 top-20 hidden h-2 w-2 rounded-full bg-theme-purple-500 blur-[1px] sm:block"
            />
            <motion.div
              aria-hidden
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 8, repeat: Infinity, delay: 1 }}
              className="pointer-events-none absolute bottom-16 left-24 hidden h-2.5 w-2.5 rounded-full bg-success-400 blur-[1px] sm:block"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-300 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
                </span>
                Free for solo founders. Forever.
              </span>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Run your business —{" "}
                <span className="bg-gradient-to-r from-brand-300 via-white to-theme-purple-500 bg-clip-text text-transparent">
                  not your tooling
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm text-white/85 sm:text-base">
                Nova BusinessOS replaces a dozen SaaS tools with one unified
                workspace. Start free in under two minutes — no credit card,
                no migration headache.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-theme-md transition hover:-translate-y-0.5 hover:bg-gray-100"
                >
                  Start free
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="transition-transform group-hover:translate-x-0.5"
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
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Book a 20-min demo
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-white/70 sm:grid-cols-4">
                <Pill>14-day Business trial</Pill>
                <Pill>No credit card</Pill>
                <Pill>Cancel anytime</Pill>
                <Pill>Built on Supabase</Pill>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6.5L5 9l4.5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </div>
  );
}
