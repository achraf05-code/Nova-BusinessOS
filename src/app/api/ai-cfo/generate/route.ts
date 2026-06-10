import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { buildCfoReport } from "@/lib/aiCfo";
import {
  listDeals,
  listExpenses,
  listInvoices,
  listProjects,
} from "@/lib/queries";
import { logActivity, notifyCompany } from "@/lib/activity";
import { requireActiveCompany } from "@/lib/tenant";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { aiCfoEmail } from "@/lib/email/templates";
import { getStore } from "@/lib/demoStore";
import { nova } from "@/config/nova";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? nova.url;

export async function POST(req: Request) {
  // Per-IP rate limit: 10 generations / 10 minutes
  const ipLimit = rateLimit(clientKey(req, "ai-cfo"), {
    windowMs: 10 * 60 * 1000,
    max: 10,
  });
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: "Too many AI CFO requests. Try again later." },
      { status: 429 }
    );
  }

  const { companyId: bodyCompanyId } = (await req
    .json()
    .catch(() => ({}))) as { companyId?: string };

  let ctx;
  try {
    ctx = await requireActiveCompany();
  } catch {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const companyId = ctx.company.id;
  if (bodyCompanyId && bodyCompanyId !== companyId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Per-company throttle: 1 every 30 seconds
  const companyLimit = rateLimit(`ai-cfo:${companyId}`, {
    windowMs: 30 * 1000,
    max: 2,
  });
  if (!companyLimit.ok) {
    return NextResponse.json(
      { error: "Slow down — please wait before generating another report." },
      { status: 429 }
    );
  }

  const [invoices, expenses, deals, projects] = await Promise.all([
    listInvoices(companyId),
    listExpenses(companyId),
    listDeals(companyId),
    listProjects(companyId),
  ]);
  const report = buildCfoReport({ invoices, expenses, deals, projects });

  if (supabaseConfigured) {
    try {
      const supabase = await createClient();
      const periodEnd = new Date();
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - 7);
      await supabase.from("ai_cfo_reports").insert({
        company_id: companyId,
        period_start: periodStart.toISOString().slice(0, 10),
        period_end: periodEnd.toISOString().slice(0, 10),
        summary: report.summary,
        insights: report.insights,
        recommendations: report.recommendations,
        forecast: report.forecast,
      } as never);
    } catch {
      /* swallow */
    }
  }

  await logActivity({
    companyId,
    actorId: ctx.user.id,
    action: "ai_cfo.report_generated",
    entityType: "ai_cfo_report",
    metadata: { insights: report.insights.length },
  });
  await notifyCompany({
    companyId,
    type: "ai_insight",
    title: "New AI CFO report",
    body: report.summary.slice(0, 140),
    href: "/dashboard/ai-cfo",
  });

  // Email opted-in members
  await emailDigestToOptedInMembers({
    companyId,
    companyName: ctx.company.name,
    summary: report.summary,
  });

  return NextResponse.json({ ok: true, report });
}

async function emailDigestToOptedInMembers(args: {
  companyId: string;
  companyName: string;
  summary: string;
}) {
  const tpl = aiCfoEmail({
    companyName: args.companyName,
    summary: args.summary,
    reportUrl: `${APP_URL}/dashboard/ai-cfo`,
  });

  if (!supabaseConfigured) {
    const store = getStore();
    const optedIn = store.preferences.filter((p) => p.email_ai_cfo_reports);
    for (let i = 0; i < optedIn.length; i++) {
      await sendEmail({
        to: "demo@mabusinessos.com",
        subject: tpl.subject,
        html: tpl.html,
        template: "ai_cfo_report",
      });
    }
    return;
  }
  try {
    const supabase = await createClient();
    const { data: members } = await supabase
      .from("company_members")
      .select("user_id")
      .eq("company_id", args.companyId);
    const userIds = (members ?? []).map(
      (m) => (m as { user_id: string }).user_id
    );
    if (userIds.length === 0) return;
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("user_id, email_ai_cfo_reports")
      .in("user_id", userIds);
    const allowed = new Set(
      ((prefs ?? []) as { user_id: string; email_ai_cfo_reports: boolean }[])
        .filter((p) => p.email_ai_cfo_reports)
        .map((p) => p.user_id)
    );
    // Default: opted-in if no preferences row yet
    for (const uid of userIds) {
      if (
        prefs &&
        (prefs as { user_id: string }[]).some((p) => p.user_id === uid)
      ) {
        if (!allowed.has(uid)) continue;
      }
      // We need the user's email — fetch from auth admin
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const admin = createAdminClient();
        const { data: userRow } = await admin.auth.admin.getUserById(uid);
        const email = userRow?.user?.email;
        if (email) {
          await sendEmail({
            to: email,
            subject: tpl.subject,
            html: tpl.html,
            template: "ai_cfo_report",
          });
        }
      } catch {
        /* skip */
      }
    }
  } catch {
    /* swallow */
  }
}
