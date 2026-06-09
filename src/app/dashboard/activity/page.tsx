import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import { listActivity, listNotifications } from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Activity" };

const TYPE_TONE: Record<string, string> = {
  invoice_paid: "bg-success-500",
  task_assigned: "bg-brand-500",
  lead_won: "bg-warning-500",
  new_employee: "bg-blue-light-500",
  ai_insight: "bg-theme-purple-500",
  system: "bg-gray-400",
};

export default async function ActivityPage() {
  const ctx = await requireActiveCompany();
  const [notifs, audit] = await Promise.all([
    listNotifications(),
    listActivity(ctx.company.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Notifications and a tenant-scoped audit log of every change in your workspace."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Notifications
          </h3>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifs.length === 0 && (
              <li className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Nothing has happened yet — go close a deal.
              </li>
            )}
            {notifs.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-4">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                    TYPE_TONE[n.type] ?? TYPE_TONE.system
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTime(n.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Audit log
          </h3>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {audit.length === 0 && (
              <li className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                No activity yet. Mutations will appear here in real time.
              </li>
            )}
            {audit.slice(0, 50).map((row) => (
              <li key={row.id} className="flex items-start gap-3 py-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="min-w-0 grow">
                  <p className="truncate text-sm text-gray-800 dark:text-white">
                    <span className="font-mono text-xs text-gray-500">
                      {row.entity_type}
                    </span>{" "}
                    · {row.action}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDateTime(row.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
