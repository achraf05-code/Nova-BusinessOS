/**
 * Nova AI CFO engine.
 *
 * Generates a deterministic financial briefing from raw company data. This
 * gives the dashboard meaningful insights even when no LLM is configured.
 * When an OPENAI_API_KEY is present a richer narrative can be substituted
 * by `generateNarrative()` (left as an integration point).
 */

import type {
  CrmDeal,
  Expense,
  Invoice,
  Project,
} from "@/types/database";

export type Tone = "positive" | "warning" | "negative" | "neutral";

export interface CfoInsight {
  title: string;
  body: string;
  tone: Tone;
  metric?: string;
}

export interface CfoRecommendation {
  title: string;
  body: string;
  effort: "low" | "medium" | "high";
}

export interface CfoForecast {
  nextMonthRevenue: number;
  nextMonthExpenses: number;
  burnRateMonthly: number;
  runwayMonths: number | null;
}

export interface CfoReport {
  summary: string;
  insights: CfoInsight[];
  recommendations: CfoRecommendation[];
  forecast: CfoForecast;
  generatedAt: string;
}

export function buildCfoReport(input: {
  invoices: Invoice[];
  expenses: Expense[];
  deals: CrmDeal[];
  projects: Project[];
  cashOnHand?: number;
}): CfoReport {
  const { invoices, expenses, deals, projects } = input;

  const paid = invoices.filter((i) => i.status === "paid");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const revenue = paid.reduce((s, i) => s + i.total, 0);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = revenue - expenseTotal;
  const margin = revenue === 0 ? 0 : profit / revenue;

  // Spend by category
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const marketingShare = byCategory["marketing"]
    ? byCategory["marketing"] / (expenseTotal || 1)
    : 0;

  // Pipeline health
  const openDeals = deals.filter(
    (d) => d.stage !== "won" && d.stage !== "lost"
  );
  const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0);
  const wonValue = deals
    .filter((d) => d.stage === "won")
    .reduce((s, d) => s + d.value, 0);
  const winRate = (() => {
    const closed = deals.filter(
      (d) => d.stage === "won" || d.stage === "lost"
    ).length;
    if (!closed) return 0;
    return deals.filter((d) => d.stage === "won").length / closed;
  })();
  const cac = deals.filter((d) => d.stage === "won").length === 0
    ? 0
    : (byCategory["marketing"] ?? 0) /
      Math.max(1, deals.filter((d) => d.stage === "won").length);

  const insights: CfoInsight[] = [];
  const recommendations: CfoRecommendation[] = [];

  // Profit narrative
  if (revenue === 0) {
    insights.push({
      title: "No revenue yet",
      body: "Mark invoices as paid (or create your first invoice) to start tracking real metrics.",
      tone: "neutral",
    });
  } else if (margin >= 0.25) {
    insights.push({
      title: `Healthy margin at ${pct(margin)}`,
      body: `You retained ${formatUsd(profit)} as profit on ${formatUsd(revenue)} revenue.`,
      tone: "positive",
    });
  } else if (margin >= 0) {
    insights.push({
      title: `Margin compressed to ${pct(margin)}`,
      body: "Profit is slim. Watch fixed costs in the next 30 days.",
      tone: "warning",
    });
    recommendations.push({
      title: "Audit recurring software costs",
      body: "Cancel or renegotiate the largest software subscriptions to lift margin by 2-3 points.",
      effort: "low",
    });
  } else {
    insights.push({
      title: "Operating at a loss this period",
      body: `Expenses (${formatUsd(expenseTotal)}) exceeded revenue (${formatUsd(revenue)}).`,
      tone: "negative",
    });
    recommendations.push({
      title: "Trigger cash conservation mode",
      body: "Freeze non-essential hires, push paid acquisition spend to a 30-day pause, and prioritize collections on overdue invoices.",
      effort: "medium",
    });
  }

  // Marketing spend ratio
  if (marketingShare > 0.35) {
    insights.push({
      title: `Marketing is ${pct(marketingShare)} of spend`,
      body: "That's high relative to operating costs — make sure pipeline is responding.",
      tone: "warning",
      metric: pct(marketingShare),
    });
    recommendations.push({
      title: "Reallocate to outbound",
      body: "Shift 15% of paid budget to outbound sales for two cycles and re-evaluate CAC.",
      effort: "medium",
    });
  }

  if (topCategory) {
    insights.push({
      title: `Top spend: ${cap(topCategory[0])}`,
      body: `${formatUsd(topCategory[1])} this period — ${pct(topCategory[1] / (expenseTotal || 1))} of total.`,
      tone: "neutral",
    });
  }

  // Pipeline narrative
  if (pipelineValue > 0) {
    insights.push({
      title: `Pipeline holds ${formatUsd(pipelineValue)}`,
      body: `${openDeals.length} active deals across all stages. Win rate so far: ${pct(winRate)}.`,
      tone: winRate >= 0.4 ? "positive" : "warning",
    });
  }
  if (cac > 0) {
    insights.push({
      title: `Estimated CAC: ${formatUsd(cac)}`,
      body: "Marketing spend divided by closed-won deals. Compare against deal size to validate ROI.",
      tone: cac > 1000 ? "warning" : "neutral",
    });
  }

  // Overdue invoices
  if (overdue.length > 0) {
    const sumOverdue = overdue.reduce((s, i) => s + i.total, 0);
    insights.push({
      title: `${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"}`,
      body: `${formatUsd(sumOverdue)} is past due. Collecting these immediately improves runway.`,
      tone: "negative",
    });
    recommendations.push({
      title: "Send dunning sequence",
      body: "Trigger a 3-step automated follow-up on every overdue invoice.",
      effort: "low",
    });
  }

  // Project capacity vs revenue
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "planning"
  ).length;
  if (activeProjects > 0 && wonValue > 0) {
    insights.push({
      title: `${activeProjects} projects in flight`,
      body: `Won deals worth ${formatUsd(wonValue)} are now operational — ensure delivery capacity matches.`,
      tone: "neutral",
    });
  }

  // Forecasts (simple linear extrapolation)
  const months = 6;
  const forecast: CfoForecast = {
    nextMonthRevenue: Math.round(revenue / months),
    nextMonthExpenses: Math.round(expenseTotal / months),
    burnRateMonthly: Math.max(0, Math.round((expenseTotal - revenue) / months)),
    runwayMonths: null,
  };
  if (forecast.burnRateMonthly > 0 && input.cashOnHand) {
    forecast.runwayMonths = Math.round(
      input.cashOnHand / forecast.burnRateMonthly
    );
  }

  const summary = buildSummary({
    revenue,
    expenseTotal,
    profit,
    pipelineValue,
    overdueCount: overdue.length,
  });

  return {
    summary,
    insights,
    recommendations,
    forecast,
    generatedAt: new Date().toISOString(),
  };
}

function buildSummary(args: {
  revenue: number;
  expenseTotal: number;
  profit: number;
  pipelineValue: number;
  overdueCount: number;
}): string {
  const trend = args.profit >= 0 ? "profitable" : "operating at a loss";
  const overdueClause =
    args.overdueCount === 0
      ? "no overdue invoices"
      : `${args.overdueCount} overdue invoice${args.overdueCount === 1 ? "" : "s"}`;
  return (
    `You're ${trend} with ${formatUsd(args.revenue)} in revenue and ` +
    `${formatUsd(args.expenseTotal)} in expenses. Pipeline holds ${formatUsd(args.pipelineValue)} ` +
    `and you have ${overdueClause}.`
  );
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}
function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
