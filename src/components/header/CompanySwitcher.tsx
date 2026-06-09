"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { setActiveCompanyAction } from "@/app/(auth-actions)/actions";

interface CompanyOption {
  id: string;
  name: string;
}

interface Props {
  current?: CompanyOption | null;
  companies?: CompanyOption[];
}

export default function CompanySwitcher({ current, companies = [] }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Render an inert UI when there's no auth context yet (SSR/no Supabase)
  const label = current?.name ?? "Workspace";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className="dropdown-toggle inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-xs font-semibold text-brand-600 dark:text-brand-400">
          {label.slice(0, 1).toUpperCase()}
        </span>
        <span className="max-w-[140px] truncate">{label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4.5 7L9 11.5L13.5 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={open}
        onClose={close}
        className="absolute left-0 mt-2 w-[260px] rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider text-gray-400">
          Companies
        </div>
        {companies.length === 0 && (
          <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
            No company yet. Create one to get started.
          </p>
        )}
        {companies.map((c) => (
          <form key={c.id} action={setActiveCompanyAction}>
            <input type="hidden" name="company_id" value={c.id} />
            <button
              type="submit"
              onClick={close}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 ${
                current?.id === c.id
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold dark:bg-gray-800">
                {c.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate">{c.name}</span>
            </button>
          </form>
        ))}
        <div className="my-2 h-px bg-gray-100 dark:bg-gray-800" />
        <Link
          href="/onboarding/company"
          onClick={close}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
        >
          + Create new company
        </Link>
      </Dropdown>
    </div>
  );
}
