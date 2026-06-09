import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import { listExpenses } from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import { formatCurrency } from "@/lib/format";
import {
  BoxIconLine,
  DollarLineIcon,
  ShootingStarIcon,
  TaskIcon,
} from "@/icons";
import ExpensesWorkspace from "@/components/dashboard/expenses/ExpensesWorkspace";

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage() {
  const ctx = await requireActiveCompany();
  const expenses = await listExpenses(ctx.company.id);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Capture receipts, categorize spend, and feed it straight into your P&L."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total spend"
          value={formatCurrency(total, ctx.company.currency)}
          icon={<DollarLineIcon />}
        />
        <KpiCard
          label="Top category"
          value={top ? top[0][0].toUpperCase() + top[0].slice(1) : "—"}
          delta={
            top
              ? { value: formatCurrency(top[1], ctx.company.currency), positive: true }
              : null
          }
          icon={<ShootingStarIcon />}
        />
        <KpiCard
          label="Transactions"
          value={String(expenses.length)}
          icon={<BoxIconLine />}
        />
        <KpiCard
          label="Average"
          value={formatCurrency(
            expenses.length ? total / expenses.length : 0,
            ctx.company.currency
          )}
          icon={<TaskIcon />}
        />
      </div>

      <ExpensesWorkspace
        expenses={expenses}
        currency={ctx.company.currency}
      />
    </div>
  );
}
