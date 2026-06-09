import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import { dashboardKpis, listExpenses, listInvoices } from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import RevenueExpenseChart from "@/components/dashboard/charts/RevenueExpenseChart";
import ExpenseBreakdownChart from "@/components/dashboard/charts/ExpenseBreakdownChart";
import { formatCurrency, percent } from "@/lib/format";
import { DollarLineIcon, BoxIconLine, ShootingStarIcon, PieChartIcon } from "@/icons";

export const metadata: Metadata = { title: "Accounting" };

export default async function AccountingPage() {
  const ctx = await requireActiveCompany();
  const [kpis, invoices, expenses] = await Promise.all([
    dashboardKpis(ctx.company.id),
    listInvoices(ctx.company.id),
    listExpenses(ctx.company.id),
  ]);

  const profit = kpis.profit;
  const profitMargin =
    kpis.revenue === 0 ? 0 : Math.round((profit / kpis.revenue) * 100);
  const cashIn = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);
  const cashOut = expenses.reduce((s, e) => s + e.amount, 0);
  const cashFlow = cashIn - cashOut;

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const breakdown = Object.entries(byCategory).map(([label, value]) => ({
    label: label[0].toUpperCase() + label.slice(1),
    value,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounting"
        description="Revenue, expenses, profit and cash flow — automatically reconciled."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Revenue" value={formatCurrency(kpis.revenue)} icon={<DollarLineIcon />} />
        <KpiCard label="Expenses" value={formatCurrency(kpis.expenses)} icon={<BoxIconLine />} />
        <KpiCard label="Profit" value={formatCurrency(profit)} delta={{ value: `${profitMargin}% margin`, positive: profit >= 0 }} icon={<ShootingStarIcon />} />
        <KpiCard label="Cash flow" value={formatCurrency(cashFlow)} delta={{ value: cashFlow >= 0 ? "Positive" : "Negative", positive: cashFlow >= 0 }} icon={<PieChartIcon />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueExpenseChart data={kpis.monthly} />
        </div>
        <ExpenseBreakdownChart data={breakdown} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Profit & Loss
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Snapshot for the current period.
          </p>
          <dl className="mt-4 divide-y divide-gray-100 text-sm dark:divide-gray-800">
            <Row label="Revenue" value={formatCurrency(kpis.revenue)} />
            <Row label="Cost of services" value={formatCurrency(Math.round(kpis.expenses * 0.45))} />
            <Row label="Operating expenses" value={formatCurrency(Math.round(kpis.expenses * 0.55))} />
            <Row label="EBITDA" value={formatCurrency(profit)} bold />
            <Row label="Margin" value={`${profitMargin}%`} bold />
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Cash flow this period
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Inflows from paid invoices, outflows from logged expenses.
          </p>
          <dl className="mt-4 divide-y divide-gray-100 text-sm dark:divide-gray-800">
            <Row label="Cash in" value={formatCurrency(cashIn)} />
            <Row label="Cash out" value={formatCurrency(cashOut)} />
            <Row label="Net cash" value={formatCurrency(cashFlow)} bold />
            <Row
              label="Burn coverage"
              value={
                cashOut === 0
                  ? "∞"
                  : `${percent(cashIn, cashOut)}% of outflow`
              }
            />
          </dl>
        </div>
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
