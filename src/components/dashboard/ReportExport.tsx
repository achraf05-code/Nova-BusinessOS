"use client";
import React, { useState } from "react";
import type {
  CrmContact,
  CrmDeal,
  Expense,
  Invoice,
  Project,
} from "@/types/database";
import { downloadReportPdf, expenseReport, profitLossReport, revenueReport } from "@/lib/reportPdf";
import {
  exportContactsXlsx,
  exportDealsXlsx,
  exportExpensesXlsx,
  exportInvoicesXlsx,
  exportProjectsXlsx,
} from "@/lib/excel";
import { useToast } from "@/components/ui/toast/ToastProvider";

interface Props {
  invoices: Invoice[];
  expenses: Expense[];
  projects: Project[];
  contacts: CrmContact[];
  deals: CrmDeal[];
  company: { name: string; currency: string };
}

function downloadCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) {
    const blob = new Blob([""], { type: "text/csv" });
    return triggerDownload(blob, filename);
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv" }), filename);
}
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ReportExport({
  invoices,
  expenses,
  projects,
  contacts,
  deals,
  company,
}: Props) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const csvInvoices = () =>
    downloadCsv(
      invoices.map((i) => ({
        number: i.number,
        status: i.status,
        issue_date: i.issue_date,
        due_date: i.due_date ?? "",
        total: i.total,
        currency: i.currency,
      })),
      "nova-invoices.csv"
    );
  const csvExpenses = () =>
    downloadCsv(
      expenses.map((e) => ({
        vendor: e.vendor,
        category: e.category,
        amount: e.amount,
        currency: e.currency,
        spent_at: e.spent_at,
      })),
      "nova-expenses.csv"
    );
  const csvProjects = () =>
    downloadCsv(
      projects.map((p) => ({
        name: p.name,
        status: p.status,
        budget: p.budget ?? "",
        start_date: p.start_date ?? "",
        due_date: p.due_date ?? "",
      })),
      "nova-projects.csv"
    );
  const csvContacts = () =>
    downloadCsv(
      contacts.map((c) => ({
        name: c.full_name,
        email: c.email ?? "",
        phone: c.phone ?? "",
        company: c.company_name ?? "",
        title: c.title ?? "",
      })),
      "nova-contacts.csv"
    );
  const csvDeals = () =>
    downloadCsv(
      deals.map((d) => ({
        title: d.title,
        value: d.value,
        currency: d.currency,
        stage: d.stage,
        probability: d.probability,
        expected_close: d.expected_close ?? "",
      })),
      "nova-deals.csv"
    );

  const xlsx =
    (kind: "invoices" | "expenses" | "projects" | "contacts" | "deals") =>
    async () => {
      try {
        if (kind === "invoices") await exportInvoicesXlsx(invoices);
        else if (kind === "expenses") await exportExpensesXlsx(expenses);
        else if (kind === "projects") await exportProjectsXlsx(projects);
        else if (kind === "contacts") await exportContactsXlsx(contacts);
        else if (kind === "deals") await exportDealsXlsx(deals);
        toast.success(`Exported ${kind}.xlsx`);
      } catch (err) {
        toast.error(
          "Excel export failed",
          err instanceof Error ? err.message : undefined
        );
      }
    };

  const pdf =
    (kind: "revenue" | "expense" | "pl") =>
    () => {
      try {
        if (kind === "revenue") {
          downloadReportPdf(
            "nova-revenue-report.pdf",
            revenueReport({ company, invoices })
          );
        } else if (kind === "expense") {
          downloadReportPdf(
            "nova-expense-report.pdf",
            expenseReport({ company, expenses })
          );
        } else {
          downloadReportPdf(
            "nova-profit-loss.pdf",
            profitLossReport({ company, invoices, expenses })
          );
        }
        toast.success("Report downloaded");
      } catch (err) {
        toast.error(
          "PDF export failed",
          err instanceof Error ? err.message : undefined
        );
      }
    };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Export ↓
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <Section label="Excel">
            <Item onClick={() => xlsx("invoices")()}>Invoices · XLSX</Item>
            <Item onClick={() => xlsx("expenses")()}>Expenses · XLSX</Item>
            <Item onClick={() => xlsx("projects")()}>Projects · XLSX</Item>
            <Item onClick={() => xlsx("contacts")()}>Contacts · XLSX</Item>
            <Item onClick={() => xlsx("deals")()}>Deals · XLSX</Item>
          </Section>
          <Section label="CSV">
            <Item onClick={csvInvoices}>Invoices · CSV</Item>
            <Item onClick={csvExpenses}>Expenses · CSV</Item>
            <Item onClick={csvProjects}>Projects · CSV</Item>
            <Item onClick={csvContacts}>Contacts · CSV</Item>
            <Item onClick={csvDeals}>Deals · CSV</Item>
          </Section>
          <Section label="PDF reports">
            <Item onClick={pdf("revenue")}>Revenue Report</Item>
            <Item onClick={pdf("expense")}>Expense Report</Item>
            <Item onClick={pdf("pl")}>Profit & Loss</Item>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
      <div className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </div>
      {children}
    </div>
  );
}
function Item({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
    >
      {children}
    </button>
  );
}
