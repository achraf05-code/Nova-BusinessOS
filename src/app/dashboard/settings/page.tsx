import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import PageHeader from "@/components/dashboard/PageHeader";
import Badge from "@/components/ui/badge/Badge";
import SettingsForm from "@/components/dashboard/settings/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const ctx = await requireActiveCompany();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace settings"
        description={`You're managing ${ctx.company.name}.`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Company profile
          </h3>
          <SettingsForm company={ctx.company} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Your role
          </h3>
          <div className="mt-3">
            <Badge color="primary">{ctx.role}</Badge>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Roles map to permissions across the workspace. Owners and admins
            can manage billing, members and integrations.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Workspaces
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You can own multiple companies under a single Nova account. Each
          workspace is isolated by Postgres Row Level Security.
        </p>
        <ul className="mt-4 divide-y divide-gray-100 text-sm dark:divide-gray-800">
          {ctx.companies.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-500/10 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {c.name}
                </span>
              </div>
              {c.id === ctx.company.id && (
                <Badge color="success" size="sm">
                  Active
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
