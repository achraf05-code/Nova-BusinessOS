import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireActiveCompany, hasRole } from "@/lib/tenant";
import { supabaseConfigured } from "@/lib/supabase/env";
import { stripeConfigured } from "@/lib/stripe";
import { emailConfigured } from "@/lib/email";
import { getCompanyUsage } from "@/lib/usage";
import { listExpenses, listSentEmails } from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import Badge from "@/components/ui/badge/Badge";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "System status" };

export default async function SystemPage() {
  const ctx = await requireActiveCompany();
  if (!hasRole(ctx.role, "admin")) {
    redirect("/dashboard/settings");
  }
  const [usage, expenses, emails] = await Promise.all([
    getCompanyUsage(ctx.company.id),
    listExpenses(ctx.company.id),
    listSentEmails(),
  ]);

  // Storage estimate: 200 KB per receipt as a reasonable mean (only used in
  // demo mode; production should expose real bucket usage via Supabase).
  const receiptCount = expenses.filter((e) => Boolean(e.receipt_url)).length;
  const storageMB = ((receiptCount * 200) / 1024).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System status"
        description="Integration health for this workspace. Admin only."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          label="Supabase"
          ok={supabaseConfigured}
          okText="Connected"
          offText="Demo mode"
        />
        <StatusCard
          label="Stripe"
          ok={stripeConfigured()}
          okText="Connected"
          offText="Not configured"
        />
        <StatusCard
          label="Email (Resend)"
          ok={emailConfigured()}
          okText="Connected"
          offText="In-memory transport"
        />
        <StatusCard
          label="Storage"
          ok={true}
          okText={`${receiptCount} receipts (~${storageMB} MB)`}
          offText="—"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Plan & usage
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Plan" value={usage.plan} />
            <Row label="Status" value={usage.status} />
            <Row
              label="Renews"
              value={
                usage.currentPeriodEnd
                  ? new Date(usage.currentPeriodEnd).toLocaleDateString()
                  : "—"
              }
            />
            <Row
              label="Members"
              value={`${usage.users.used}${
                usage.users.limit < 0 ? "" : ` / ${usage.users.limit}`
              }`}
            />
            <Row
              label="Contacts"
              value={`${usage.contacts.used}${
                usage.contacts.limit < 0 ? "" : ` / ${usage.contacts.limit}`
              }`}
            />
            <Row
              label="Projects"
              value={`${usage.projects.used}${
                usage.projects.limit < 0 ? "" : ` / ${usage.projects.limit}`
              }`}
            />
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Recent emails
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Captured by the in-memory transport when Resend is not configured.
          </p>
          <ul className="mt-4 divide-y divide-gray-100 text-sm dark:divide-gray-800">
            {emails.length === 0 && (
              <li className="py-6 text-center text-gray-500 dark:text-gray-400">
                No outgoing emails yet.
              </li>
            )}
            {emails.slice(0, 8).map((e) => (
              <li key={e.id} className="py-3">
                <p className="font-medium text-gray-800 dark:text-white">
                  {e.subject}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  to {e.to} · {formatDateTime(e.created_at)} · {e.template}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  ok,
  okText,
  offText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  offText: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Badge size="sm" color={ok ? "success" : "warning"}>
          {ok ? "OK" : "Demo"}
        </Badge>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {ok ? okText : offText}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-white">{value}</span>
    </div>
  );
}
