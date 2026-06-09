import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveCompany } from "@/lib/tenant";
import { listEmployees } from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { GroupIcon, UserCircleIcon, TaskIcon } from "@/icons";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage() {
  const ctx = await requireActiveCompany();
  const employees = await listEmployees(ctx.company.id);

  const departments = new Set(
    employees.map((e) => e.department).filter(Boolean) as string[]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Profiles, departments, attendance and leave tracking — kept simple."
        actions={
          <Link
            href="/dashboard/employees"
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            + Add employee
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Headcount" value={String(employees.length)} icon={<GroupIcon />} />
        <KpiCard label="Departments" value={String(departments.size)} icon={<TaskIcon />} />
        <KpiCard
          label="Active"
          value={String(employees.filter((e) => e.status === "active").length)}
          icon={<UserCircleIcon />}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Team
        </h3>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Role
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Department
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {e.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span>
                        {e.full_name}
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {e.email}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {e.role_title ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {e.department ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      size="sm"
                      color={
                        e.status === "active"
                          ? "success"
                          : e.status === "on_leave"
                          ? "warning"
                          : "error"
                      }
                    >
                      {e.status.replace("_", " ")}
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
