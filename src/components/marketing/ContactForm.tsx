"use client";
import React, { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder: a real implementation would POST to /api/contact.
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-success-200 bg-success-50 p-8 text-success-800 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-300">
        <h3 className="text-lg font-semibold">Thanks — message received.</h3>
        <p className="mt-2 text-sm">
          A human from the Nova team will reply soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Full name</Label>
          <Input name="name" placeholder="Jane Doe" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" name="email" placeholder="you@company.com" />
        </div>
      </div>
      <div>
        <Label>Company</Label>
        <Input name="company" placeholder="Acme Inc." />
      </div>
      <div>
        <Label>How can we help?</Label>
        <textarea
          name="message"
          rows={5}
          className="h-auto w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          placeholder="Tell us a bit about your team and what you're trying to solve…"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
