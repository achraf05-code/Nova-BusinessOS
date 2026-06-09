import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import PageHeader from "@/components/dashboard/PageHeader";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const ctx = await requireActiveCompany();
  const initials =
    (ctx.user.email ?? "")
      .split(/[@.]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "NV";

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Manage your personal information and preferences."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10 text-2xl font-semibold text-brand-600 dark:text-brand-400">
            {initials}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {ctx.user.email}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Member of {ctx.company.name}
            </p>
            <div className="mt-2">
              <Badge color="primary" size="sm">
                Role · {ctx.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Personal information
          </h3>
          <form className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>First name</Label>
              <Input placeholder="Jane" />
            </div>
            <div>
              <Label>Last name</Label>
              <Input placeholder="Doe" />
            </div>
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <Input defaultValue={ctx.user.email ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Security
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Reset your password or sign out across all devices.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href="/forgot-password"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Reset password
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
