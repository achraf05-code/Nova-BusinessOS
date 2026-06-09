import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import {
  listDeals,
  listExpenses,
  listInvoices,
  listProjects,
  listAiCfoReports,
} from "@/lib/queries";
import { buildCfoReport, type Tone } from "@/lib/aiCfo";
import PageHeader from "@/components/dashboard/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import { formatCurrency, formatDate } from "@/lib/format";
import { ShootingStarIcon, DollarLineIcon, BoxIconLine, PieChartIcon } from "@/icons";
import GenerateReportButton from "@/components/dashboard/GenerateReportButton";

export const metadata: Metadata = { title: "AI CFO" };

const TONE_CLASS: Record<Tone, string> = {
  positive:
    "border-success-200 bg-success-50 text-success-800 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-300",
  warning:
    "border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-300",
  negative:
    "border-error-200 bg-error-50 text-error-800 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300",
  neutral:
    "border-blue-light-200 bg-blue-light-50 text-blue-light-800 dark:border-blue-light-500/30 dark:bg-blue-light-500/10 dark:text-blue-light-300",
};

export default async function AiCfoPage() {
  const ctx = await requireActiveCompany();
  const [invoices, expenses, deals, projects, history] = await Promise.all([
    listInvoices(ctx.company.id),
    listExpenses(ctx.company.id),
    listDeals(ctx.company.id),
    listProjects(ctx.company.id),
    listAiCfoReports(ctx.company.id),
  ]);

  const report = buildCfoReport({ invoices, expenses, deals, projects });

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI CFO"
        description="Your always-on financial brain — analyzes revenue, expenses, clients and pipeline, then surfaces what matters."
        actions={<GenerateReportButton companyId={ctx.company.id} />}
      />

      <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-6 dark:border-brand-500/30 dark:from-brand-500/10 dark:to-gray-900">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Executive briefing
        </div>
        <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
          {report.summary}
        </h2>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Generated {formatDate(report.generatedAt)} · live calculation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Forecast next month · Revenue"
          value={formatCurrency(report.forecast.nextMonthRevenue)}
          icon={<DollarLineIcon />}
        />
        <KpiCard
          label="Forecast next month · Expenses"
          value={formatCurrency(report.forecast.nextMonthExpenses)}
          icon={<BoxIconLine />}
        />
        <KpiCard
          label="Monthly burn"
          value={formatCurrency(report.forecast.burnRateMonthly)}
          icon={<PieChartIcon />}
        />
        <KpiCard
          label="Runway"
          value={
            report.forecast.runwayMonths === null
              ? "Set cash on hand →"
              : `${report.forecast.runwayMonths} mo`
          }
          icon={<ShootingStarIcon />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
            Insights
          </h3>
          <div className="space-y-3">
            {report.insights.map((i) => (
              <div
                key={i.title}
                className={`rounded-2xl border p-5 ${TONE_CLASS[i.tone]}`}
              >
                <p className="text-sm font-semibold">{i.title}</p>
                <p className="mt-1 text-sm opacity-90">{i.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
            Recommendations
          </h3>
          <div className="space-y-3">
            {report.recommendations.length === 0 && (
              <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.02]">
                No recommendations right now — your finances are on track.
              </p>
            )}
            {report.recommendations.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {r.title}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      r.effort === "low"
                        ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300"
                        : r.effort === "medium"
                        ? "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300"
                        : "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300"
                    }`}
                  >
                    {r.effort} effort
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Past reports
          </h3>
          <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
            {history.map((r) => (
              <li key={r.id} className="flex items-start justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {r.summary}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(r.period_start)} — {formatDate(r.period_end)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
