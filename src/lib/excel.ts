"use client";
/**
 * xlsx exports for Reports + per-module data dumps. The library is
 * dynamic-imported so it never ships in the marketing bundle.
 */
import type {
  CrmContact,
  CrmDeal,
  Expense,
  Invoice,
  Project,
} from "@/types/database";

async function lib() {
  return (await import("xlsx")) as typeof import("xlsx");
}

function downloadBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSheets(
  filename: string,
  sheets: { name: string; rows: Record<string, unknown>[] }[]
) {
  const XLSX = await lib();
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  }
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  downloadBuffer(out, filename);
}

export async function exportContactsXlsx(rows: CrmContact[]) {
  await exportSheets("nova-contacts.xlsx", [
    {
      name: "Contacts",
      rows: rows.map((c) => ({
        Name: c.full_name,
        Email: c.email ?? "",
        Phone: c.phone ?? "",
        Company: c.company_name ?? "",
        Title: c.title ?? "",
        Source: c.source ?? "",
        "Created at": c.created_at,
      })),
    },
  ]);
}

export async function exportDealsXlsx(rows: CrmDeal[]) {
  await exportSheets("nova-deals.xlsx", [
    {
      name: "Deals",
      rows: rows.map((d) => ({
        Title: d.title,
        Value: d.value,
        Currency: d.currency,
        Stage: d.stage,
        Probability: d.probability,
        "Expected close": d.expected_close ?? "",
        "Updated at": d.updated_at,
      })),
    },
  ]);
}

export async function exportProjectsXlsx(rows: Project[]) {
  await exportSheets("nova-projects.xlsx", [
    {
      name: "Projects",
      rows: rows.map((p) => ({
        Name: p.name,
        Status: p.status,
        Budget: p.budget ?? "",
        "Start date": p.start_date ?? "",
        "Due date": p.due_date ?? "",
        Description: p.description ?? "",
      })),
    },
  ]);
}

export async function exportInvoicesXlsx(rows: Invoice[]) {
  await exportSheets("nova-invoices.xlsx", [
    {
      name: "Invoices",
      rows: rows.map((i) => ({
        Number: i.number,
        Status: i.status,
        Issued: i.issue_date,
        Due: i.due_date ?? "",
        Subtotal: i.subtotal,
        "Tax %": i.tax_rate,
        Tax: i.tax_amount,
        Total: i.total,
        Currency: i.currency,
        Notes: i.notes ?? "",
      })),
    },
  ]);
}

export async function exportExpensesXlsx(rows: Expense[]) {
  await exportSheets("nova-expenses.xlsx", [
    {
      name: "Expenses",
      rows: rows.map((e) => ({
        Vendor: e.vendor,
        Category: e.category,
        Amount: e.amount,
        Currency: e.currency,
        Date: e.spent_at,
        Notes: e.notes ?? "",
      })),
    },
  ]);
}
