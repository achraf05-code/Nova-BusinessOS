import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import {
  listContacts,
  listEmployees,
  listProjects,
  listTasks,
} from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import { formatCurrency } from "@/lib/format";
import { TaskIcon, BoxIconLine, DollarLineIcon, GroupIcon } from "@/icons";
import ProjectsWorkspace from "@/components/dashboard/projects/ProjectsWorkspace";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const ctx = await requireActiveCompany();
  const [projects, tasks, contacts, employees] = await Promise.all([
    listProjects(ctx.company.id),
    listTasks(ctx.company.id),
    listContacts(ctx.company.id),
    listEmployees(ctx.company.id),
  ]);

  const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0);
  const active = projects.filter(
    (p) => p.status === "in_progress" || p.status === "planning"
  ).length;
  const tasksDone = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Kanban-first project management with priorities, deadlines, and team-wide visibility."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active projects"
          value={String(active)}
          icon={<TaskIcon />}
        />
        <KpiCard
          label="Total tasks"
          value={String(tasks.length)}
          icon={<BoxIconLine />}
        />
        <KpiCard
          label="Tasks done"
          value={String(tasksDone)}
          icon={<GroupIcon />}
        />
        <KpiCard
          label="Combined budget"
          value={formatCurrency(totalBudget, ctx.company.currency)}
          icon={<DollarLineIcon />}
        />
      </div>

      <ProjectsWorkspace
        projects={projects}
        tasks={tasks}
        contacts={contacts}
        employees={employees}
      />
    </div>
  );
}
