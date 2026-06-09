"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  CrmContact,
  Employee,
  Project,
  Task,
  TaskStatus,
} from "@/types/database";
import KanbanBoardDnd from "@/components/dashboard/projects/KanbanBoardDnd";
import ProjectFormModal from "@/components/dashboard/projects/ProjectFormModal";
import TaskFormModal from "@/components/dashboard/projects/TaskFormModal";
import ConfirmDialog from "@/components/ui/dialog/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  deleteProjectAction,
  deleteTaskAction,
} from "@/app/dashboard/projects/actions";
import { PencilIcon, TrashBinIcon } from "@/icons";

interface Props {
  projects: Project[];
  tasks: Task[];
  contacts: CrmContact[];
  employees: Employee[];
}

const STATUS_COLOR = {
  planning: "info",
  in_progress: "primary",
  on_hold: "warning",
  completed: "success",
  cancelled: "error",
} as const;

export default function ProjectsWorkspace({
  projects,
  tasks,
  contacts,
  employees,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();

  const [projForm, setProjForm] = useState<{
    open: boolean;
    initial: Project | null;
  }>({ open: false, initial: null });
  const [taskForm, setTaskForm] = useState<{
    open: boolean;
    initial: Task | null;
    defaultStatus: TaskStatus;
  }>({ open: false, initial: null, defaultStatus: "todo" });

  const [confirmProj, setConfirmProj] = useState<Project | null>(null);
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => router.refresh();

  const onDeleteTask = (t: Task) => setConfirmTask(t);
  const onDeleteProject = (p: Project) => setConfirmProj(p);

  const confirmDeleteTask = () => {
    if (!confirmTask) return;
    const id = confirmTask.id;
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteTaskAction(id);
      setDeleting(false);
      if (!res.ok) toast.error("Couldn't delete task", res.error);
      else {
        toast.success("Task deleted");
        refresh();
      }
      setConfirmTask(null);
    });
  };
  const confirmDeleteProject = () => {
    if (!confirmProj) return;
    const id = confirmProj.id;
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteProjectAction(id);
      setDeleting(false);
      if (!res.ok) toast.error("Couldn't delete project", res.error);
      else {
        toast.success("Project deleted");
        refresh();
      }
      setConfirmProj(null);
    });
  };

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            setTaskForm({ open: true, initial: null, defaultStatus: "todo" })
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          + Task
        </button>
        <button
          type="button"
          onClick={() => setProjForm({ open: true, initial: null })}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New project
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Tasks board
        </h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Drag tasks between columns to update their status.
        </p>
        <KanbanBoardDnd
          tasks={tasks}
          onEdit={(t) =>
            setTaskForm({ open: true, initial: t, defaultStatus: t.status })
          }
          onDelete={onDeleteTask}
          onAddInColumn={(status) =>
            setTaskForm({ open: true, initial: null, defaultStatus: status })
          }
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Projects
          </h3>
          <span className="text-xs text-gray-500">{projects.length} total</span>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <Th>Project</Th>
                <Th>Status</Th>
                <Th>Budget</Th>
                <Th>Due</Th>
                <Th className="text-right">Actions</Th>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {p.name}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge size="sm" color={STATUS_COLOR[p.status]}>
                      {p.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {p.budget ? formatCurrency(p.budget) : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(p.due_date)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setProjForm({ open: true, initial: p })
                        }
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                        aria-label="Edit project"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProject(p)}
                        className="rounded p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
                        aria-label="Delete project"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No projects yet. Create your first one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ProjectFormModal
        isOpen={projForm.open}
        onClose={() => setProjForm({ open: false, initial: null })}
        initial={projForm.initial}
        contacts={contacts}
        onSaved={refresh}
      />
      <TaskFormModal
        isOpen={taskForm.open}
        onClose={() =>
          setTaskForm({ open: false, initial: null, defaultStatus: "todo" })
        }
        initial={taskForm.initial}
        defaultStatus={taskForm.defaultStatus}
        projects={projects}
        employees={employees}
        onSaved={refresh}
      />
      <ConfirmDialog
        isOpen={Boolean(confirmTask)}
        title={`Delete task ${confirmTask?.title ?? ""}?`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDeleteTask}
        onClose={() => setConfirmTask(null)}
      />
      <ConfirmDialog
        isOpen={Boolean(confirmProj)}
        title={`Delete project ${confirmProj?.name ?? ""}?`}
        description="Tasks attached to this project will be cascade-deleted."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDeleteProject}
        onClose={() => setConfirmProj(null)}
      />
    </>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableCell
      isHeader
      className={`px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </TableCell>
  );
}
