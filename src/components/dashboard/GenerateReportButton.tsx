"use client";
import React, { useState } from "react";

interface Props {
  companyId: string;
}

export default function GenerateReportButton({ companyId }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onClick = async () => {
    setLoading(true);
    setDone(false);
    try {
      const res = await fetch("/api/ai-cfo/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      setDone(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
    >
      {loading ? "Analyzing…" : done ? "Saved ✓" : "Generate weekly report"}
    </button>
  );
}
