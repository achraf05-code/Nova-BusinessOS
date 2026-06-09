import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import {
  dashboardKpis,
  listContacts,
  listDeals,
  listExpenses,
  listInvoices,
  listProjects,
} from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import RevenueExpenseChart from "@/components/dashboard/charts/RevenueExpenseChart";
import { formatCurrency } from "@/lib/format";
import ReportExport from "@/components/dashboard/ReportExport";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const ctx = await requireActiveCompany();
  const [kpis, invoices, expenses, projects, contacts, deals] =
    await Promise.all([
      dashboardKpis(ctx.company.id),
      listInvoices(ctx.company.id),
      listExpenses(ctx.company.id),
      listProjects(ctx.company.id),
      listContacts(ctx.company.id),
      listDeals(ctx.company.id),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Business reports across revenue, expenses and operations. CSV, Excel and PDF exports."
        actions={
          <ReportExport
            invoices={invoices}
            expenses={expenses}
            projects={projects}
            contacts={contacts}
            deals={deals}
            company={{ name: ctx.company.name, currency: ctx.company.currency }}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueExpenseChart data={kpis.monthly} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Period totals
          </h3>
          <dl className="mt-4 divide-y divide-gray-100 text-sm dark:divide-gray-800">
            <Row
              label="Revenue"
              value={formatCurrency(kpis.revenue, ctx.company.currency)}
            />
            <Row
              label="Expenses"
              value={formatCurrency(kpis.expenses, ctx.company.currency)}
            />
            <Row
              label="Profit"
              value={formatCurrency(kpis.profit, ctx.company.currency)}
              bold
            />
            <Row
              label="Won deals"
              value={formatCurrency(kpis.wonValue, ctx.company.currency)}
            />
            <Row label="Active projects" value={String(kpis.activeProjects)} />
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Available reports
        </h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {[
            "Profit & Loss",
            "Revenue by client",
            "Expenses by category",
            "Cash flow",
            "Invoice aging",
            "Pipeline forecast",
          ].map((r) => (
            <li
              key={r}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.02]"
            >
              <span className="font-medium text-gray-800 dark:text-white">
                {r}
              </span>
              <span className="text-xs text-gray-400">CSV · Excel · PDF</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd
        className={`text-gray-800 dark:text-white ${
          bold ? "text-base font-semibold" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
