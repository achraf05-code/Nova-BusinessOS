import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveCompany } from "@/lib/tenant";
import {
  dashboardKpis,
  listDeals,
  listInvoices,
  listAiCfoReports,
} from "@/lib/queries";
import KpiCard from "@/components/dashboard/KpiCard";
import PageHeader from "@/components/dashboard/PageHeader";
import RevenueExpenseChart from "@/components/dashboard/charts/RevenueExpenseChart";
import PipelineChart from "@/components/dashboard/charts/PipelineChart";
import { formatCurrency } from "@/lib/format";
import {
  DollarLineIcon,
  GroupIcon,
  TaskIcon,
  BoxIconLine,
} from "@/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

export const metadata: Metadata = {
  title: "Dashboard",
};

const STAGE_ORDER = [
  "lead",
  "contacted",
  "meeting",
  "proposal",
  "won",
] as const;

export default async function DashboardOverviewPage() {
  const ctx = await requireActiveCompany();
  const [kpis, deals, invoices, reports] = await Promise.all([
    dashboardKpis(ctx.company.id),
    listDeals(ctx.company.id),
    listInvoices(ctx.company.id),
    listAiCfoReports(ctx.company.id),
  ]);

  const pipeline = STAGE_ORDER.map((stage) => {
    const matching = deals.filter((d) => d.stage === stage);
    return {
      stage: stage[0].toUpperCase() + stage.slice(1),
      value: matching.reduce((s, d) => s + d.value, 0),
      count: matching.length,
    };
  });

  const recentInvoices = invoices.slice(0, 5);
  const latestReport = reports[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back · ${ctx.company.name}`}
        description="Your business at a glance — revenue, pipeline, projects and AI CFO insights."
        actions={
          <Link
            href="/dashboard/ai-cfo"
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            View AI CFO →
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue (paid)"
          value={formatCurrency(kpis.revenue, ctx.company.currency)}
          delta={{ value: "12.4%", positive: true }}
          icon={<DollarLineIcon />}
        />
        <KpiCard
          label="Open deals"
          value={String(kpis.openDeals)}
          delta={{ value: "3", positive: true }}
          icon={<GroupIcon />}
        />
        <KpiCard
          label="Active projects"
          value={String(kpis.activeProjects)}
          icon={<TaskIcon />}
        />
        <KpiCard
          label="Expenses"
          value={formatCurrency(kpis.expenses, ctx.company.currency)}
          delta={{ value: "8.1%", positive: false }}
          icon={<BoxIconLine />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueExpenseChart data={kpis.monthly} />
        </div>
        <div>
          <PipelineChart data={pipeline} />
        </div>
      </div>

      {latestReport && (
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5 dark:border-brand-500/30 dark:from-brand-500/10 dark:to-gray-900 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Latest AI CFO insight
          </div>
          <p className="mt-2 text-base font-medium text-gray-800 dark:text-white/90">
            {latestReport.summary}
          </p>
          <Link
            href="/dashboard/ai-cfo"
            className="mt-3 inline-flex text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            Read full report →
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Recent invoices
          </h3>
          <Link
            href="/dashboard/invoices"
            className="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            View all
          </Link>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Invoice
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Client
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Total
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {recentInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    #{inv.number}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {inv.notes ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatCurrency(inv.total, inv.currency)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      size="sm"
                      color={
                        inv.status === "paid"
                          ? "success"
                          : inv.status === "overdue"
                          ? "error"
                          : inv.status === "sent"
                          ? "warning"
                          : "light"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
