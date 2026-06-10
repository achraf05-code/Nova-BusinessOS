"use client";
import React from "react";
import { Reveal, Stagger, FadeUpItem } from "./motion";

const PILLARS = [
  {
    icon: <Layers />,
    title: "Multi-tenant by design",
    body: "Every record is scoped by company_id. One database, perfect isolation — backed by Postgres, not application-level checks.",
  },
  {
    icon: <Shield />,
    title: "Row Level Security",
    body: "Every table has explicit RLS policies enforced by Postgres. Even compromised application code can&apos;t cross tenant boundaries.",
  },
  {
    icon: <Lock />,
    title: "RBAC with four tiers",
    body: "Owner, Admin, Manager, Employee — gated at both the SQL layer and every server action. Symmetric, auditable.",
  },
  {
    icon: <Eye />,
    title: "Tenant-scoped audit log",
    body: "Every mutation writes a row with actor, action, entity, metadata. Filter, search and export your full history.",
  },
  {
    icon: <Cloud />,
    title: "Secure infrastructure",
    body: "Built on Supabase (Postgres + Auth + Storage) and deployed on Vercel. Encrypted at rest, in flight, and during backups.",
  },
  {
    icon: <Pulse />,
    title: "Rate-limited surfaces",
    body: "Login, invitations and AI CFO endpoints are throttled per IP and per company. Stripe webhooks are signed and verified.",
  },
];

export default function Security() {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-24 dark:bg-gray-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_80%_0%,rgba(70,95,255,0.08),transparent)]"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-3 py-1 text-xs font-medium text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-300">
            <ShieldDot /> Enterprise-grade security
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Your data, isolated and audited.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            Nova is built on principles that work at billion-dollar scale —
            applied to your team from day one.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <FadeUpItem key={p.title}>
              <div className="group relative h-full rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-success-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-success-500/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/10 text-success-600 dark:text-success-400">
                  {p.icon}
                </div>
                <h3 className="mt-5 text-base font-semibold text-gray-900 dark:text-white">
                  {p.title}
                </h3>
                <p
                  className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: p.body }}
                />
              </div>
            </FadeUpItem>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Encryption", value: "AES-256 at rest · TLS 1.3" },
              { label: "Backups", value: "Daily · 30-day retention" },
              { label: "Compliance", value: "SOC 2-ready architecture" },
              { label: "Privacy", value: "GDPR-aligned, data export anytime" },
            ].map((b) => (
              <div
                key={b.label}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {b.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {b.value}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const I = (children: React.ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    {children}
  </svg>
);
function Shield() {
  return I(
    <path
      d="M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6l8-4z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  );
}
function Layers() {
  return I(
    <path
      d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}
function Lock() {
  return I(
    <path
      d="M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function Eye() {
  return I(
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function Cloud() {
  return I(
    <path
      d="M7 17a4 4 0 0 1 0-8 6 6 0 0 1 11.7 1.6A4 4 0 0 1 18 17H7z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  );
}
function Pulse() {
  return I(
    <path
      d="M3 12h4l2-7 4 14 2-7h6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
function ShieldDot() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1l8 4v7c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-4z" />
    </svg>
  );
}
