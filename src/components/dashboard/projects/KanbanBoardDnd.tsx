"use client";
import React, { useOptimistic, useState, useTransition } from "react";
import type { Task, TaskStatus } from "@/types/database";
import Badge from "@/components/ui/badge/Badge";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { moveTaskStatusAction } from "@/app/dashboard/projects/actions";
import { TrashBinIcon, PencilIcon } from "@/icons";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "in_review", label: "In review" },
  { id: "done", label: "Done" },
];

interface Props {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onAddInColumn?: (status: TaskStatus) => void;
}

type Action = { id: string; status: TaskStatus };

export default function KanbanBoardDnd({
  tasks,
  onEdit,
  onDelete,
  onAddInColumn,
}: Props) {
  const [optimistic, applyOptimistic] = useOptimistic<Task[], Action>(
    tasks,
    (state, action) =>
      state.map((t) =>
        t.id === action.id ? { ...t, status: action.status } : t
      )
  );
  const [hoverCol, setHoverCol] = useState<TaskStatus | null>(null);
  const [, startTransition] = useTransition();
  const toast = useToast();

  const moveTo = (id: string, status: TaskStatus) => {
    const before = optimistic.find((t) => t.id === id);
    if (!before || before.status === status) return;
    startTransition(async () => {
      applyOptimistic({ id, status });
      const res = await moveTaskStatusAction(id, status);
      if (!res.ok) {
        applyOptimistic({ id, status: before.status });
        toast.error("Could not move task", res.error);
      }
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = optimistic.filter((t) => t.status === col.id);
        const isHover = hoverCol === col.id;
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (hoverCol !== col.id) setHoverCol(col.id);
            }}
            onDragLeave={() => {
              if (hoverCol === col.id) setHoverCol(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/task");
              setHoverCol(null);
              if (id) moveTo(id, col.id);
            }}
            className={`flex flex-col rounded-2xl border bg-gray-50 p-3 transition-colors dark:bg-white/[0.02] ${
              isHover
                ? "border-brand-400 ring-2 ring-brand-500/20"
                : "border-gray-200 dark:border-gray-800"
            }`}
          >
            <header className="mb-3 flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                {col.label}
              </span>
              <div className="flex items-center gap-1">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  {items.length}
                </span>
                <button
                  type="button"
                  onClick={() => onAddInColumn?.(col.id)}
                  className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-200"
                  aria-label={`Add task to ${col.label}`}
                >
                  +
                </button>
              </div>
            </header>
            <div className="flex flex-col gap-2">
              {items.map((t) => (
                <article
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/task", t.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="group cursor-grab rounded-xl border border-gray-200 bg-white p-3 shadow-theme-xs active:cursor-grabbing dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEdit?.(t)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        aria-label="Edit task"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(t)}
                        className="rounded p-1 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
                        aria-label="Delete task"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        t.priority === "urgent"
                          ? "error"
                          : t.priority === "high"
                          ? "warning"
                          : t.priority === "medium"
                          ? "info"
                          : "light"
                      }
                    >
                      {t.priority}
                    </Badge>
                    <span>{formatDate(t.due_date)}</span>
                  </div>
                </article>
              ))}
              {items.length === 0 && (
                <p className="px-1 py-3 text-xs text-gray-400 dark:text-gray-500">
                  Drop a task here, or add one.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
