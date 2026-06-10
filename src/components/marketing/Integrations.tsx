"use client";
import React from "react";
import { Reveal, Stagger, FadeUpItem } from "./motion";

interface Integration {
  name: string;
  status: "live" | "soon";
  category: string;
  logo: React.ReactNode;
}

const INTEGRATIONS: Integration[] = [
  { name: "Stripe", status: "live", category: "Billing", logo: <Stripe /> },
  { name: "Supabase", status: "live", category: "Data", logo: <Supabase /> },
  { name: "Resend", status: "live", category: "Email", logo: <Resend /> },
  { name: "Gmail", status: "soon", category: "Email", logo: <Gmail /> },
  { name: "Outlook", status: "soon", category: "Email", logo: <Outlook /> },
  { name: "Slack", status: "soon", category: "Comms", logo: <Slack /> },
  { name: "WhatsApp", status: "soon", category: "Comms", logo: <Whatsapp /> },
  { name: "Google Calendar", status: "soon", category: "Calendar", logo: <GCal /> },
  { name: "Zapier", status: "soon", category: "Automation", logo: <Zap /> },
  { name: "Notion", status: "soon", category: "Docs", logo: <NotionLogo /> },
];

export default function Integrations() {
  return (
    <section className="relative bg-white py-24 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Integrations
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Plays nicely with the tools you keep.
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            Stripe, Supabase and Resend ship today. Email, calendars,
            messaging and automation are next on the roadmap.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {INTEGRATIONS.map((i) => (
            <FadeUpItem key={i.name}>
              <div className="group relative h-full rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 transition group-hover:bg-brand-500/5 dark:bg-white/[0.04]">
                  {i.logo}
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {i.name}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <span className="text-gray-500 dark:text-gray-400">
                    {i.category}
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <span
                    className={
                      i.status === "live"
                        ? "font-semibold text-success-600 dark:text-success-400"
                        : "font-semibold text-brand-600 dark:text-brand-400"
                    }
                  >
                    {i.status === "live" ? "Live" : "Soon"}
                  </span>
                </div>
              </div>
            </FadeUpItem>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <p className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t see your tool? Public REST API + webhooks are on the
            roadmap. <a href="/contact" className="font-medium text-brand-500 hover:text-brand-600">Request an integration →</a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---- Tiny brand-tinted glyph logos (no third-party assets) ---- */
const wrap = (color: string, glyph: React.ReactNode) => (
  <span style={{ color }} className="inline-flex h-7 w-7 items-center justify-center">
    {glyph}
  </span>
);
function Stripe() {
  return wrap(
    "#635bff",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm-1.2 13.6c1.7 0 2.7-.8 2.7-2 0-1.1-.7-1.6-2.4-2.1-.9-.3-1.3-.5-1.3-.9 0-.3.3-.5.8-.5.7 0 1.6.3 2.4.8V9.1c-.7-.3-1.6-.5-2.4-.5-1.7 0-2.7.9-2.7 2 0 1.1.7 1.6 2.3 2.1.9.3 1.3.5 1.3.9 0 .3-.3.5-.9.5-.8 0-1.9-.4-2.7-.8v1.8c.8.3 1.8.5 2.9.5z" />
    </svg>
  );
}
function Supabase() {
  return wrap(
    "#3ecf8e",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M13 2v9h7L11 22v-9H4l9-11z" />
    </svg>
  );
}
function Resend() {
  return wrap(
    "#000",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6.5l9 6 9-6M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" strokeLinejoin="round" />
    </svg>
  );
}
function Gmail() {
  return wrap(
    "#ea4335",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M3 6l9 6 9-6v12a1 1 0 0 1-1 1h-4V12l-4 3-4-3v7H4a1 1 0 0 1-1-1V6z" />
    </svg>
  );
}
function Outlook() {
  return wrap(
    "#0078d4",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M2 5l11-2v18L2 19V5zm12 2v10l8 1V6l-8 1zm-7 4a3 3 0 1 1 0 2 3 3 0 0 1 0-2z" />
    </svg>
  );
}
function Slack() {
  return wrap(
    "#4a154b",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}
function Whatsapp() {
  return wrap(
    "#25d366",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 5 18.6L22 22l-1.4-4.7A10 10 0 0 0 12 2zm5.2 14.6c-.3.7-1.7 1.4-2.4 1.4-1.7-.1-4-1-5.5-2.6-1.6-1.5-2.5-3.8-2.6-5.5 0-.7.7-2 1.4-2.4.4-.2.8-.2 1.1 0l.7 1.6c.1.3 0 .6-.2.8l-.5.5c-.2.2-.3.5-.1.8.4.7 1 1.5 1.7 2.2.7.7 1.5 1.3 2.2 1.7.3.2.6.1.8-.1l.5-.5c.2-.2.5-.3.8-.2l1.6.7c.2.3.2.7 0 1.1z" />
    </svg>
  );
}
function GCal() {
  return wrap(
    "#4285f4",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 6v10h14V10H5zm3-6v3h2V4H8zm6 0v3h2V4h-2z" />
    </svg>
  );
}
function Zap() {
  return wrap(
    "#ff4a00",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M13 2L3 14h7l-1 8 11-13h-7l1-7z" />
    </svg>
  );
}
function NotionLogo() {
  return wrap(
    "#000",
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M4 4l4-1 12 1v15l-4 1-12-1V4zm3 2v12l9 .8V6.8L7 6zm2 1.5l5 7V8l-5-.5z" />
    </svg>
  );
}
