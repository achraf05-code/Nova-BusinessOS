"use client";
import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import Field from "@/components/form/Field";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/TextArea";
import NativeSelect from "@/components/form/NativeSelect";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  createTaskAction,
  updateTaskAction,
} from "@/app/dashboard/projects/actions";
import type {
  Employee,
  Project,
  Task,
  TaskStatus,
} from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: Task | null;
  defaultStatus?: TaskStatus;
  projects: Project[];
  employees: Employee[];
  onSaved?: () => void;
}

const STATUS_OPTS = [
  { label: "To do", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "In review", value: "in_review" },
  { label: "Done", value: "done" },
];
const PRIORITY_OPTS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export default function TaskFormModal({
  isOpen,
  onClose,
  initial,
  defaultStatus = "todo",
  projects,
  employees,
  onSaved,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const isEdit = Boolean(initial?.id);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setErrors({});
    startTransition(async () => {
      const res = isEdit
        ? await updateTaskAction(initial!.id, data)
        : await createTaskAction(data);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(isEdit ? "Task updated" : "Task created");
      onSaved?.();
      onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-xl">
      <div className="p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit task" : "New task"}
        </h3>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <Field label="Title" required error={errors.title}>
            <Input name="title" defaultValue={initial?.title} />
          </Field>
          <Field label="Description" error={errors.description}>
            <TextArea
              name="description"
              defaultValue={initial?.description ?? ""}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project" error={errors.project_id}>
              <NativeSelect
                name="project_id"
                defaultValue={initial?.project_id ?? ""}
                options={[
                  { label: "— None —", value: "" },
                  ...projects.map((p) => ({ label: p.name, value: p.id })),
                ]}
              />
            </Field>
            <Field label="Assigned to" error={errors.assigned_to}>
              <NativeSelect
                name="assigned_to"
                defaultValue={initial?.assigned_to ?? ""}
                options={[
                  { label: "— Unassigned —", value: "" },
                  ...employees
                    .filter((e) => e.user_id)
                    .map((e) => ({
                      label: e.full_name,
                      value: e.user_id as string,
                    })),
                ]}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Status" error={errors.status}>
              <NativeSelect
                name="status"
                defaultValue={initial?.status ?? defaultStatus}
                options={STATUS_OPTS}
              />
            </Field>
            <Field label="Priority" error={errors.priority}>
              <NativeSelect
                name="priority"
                defaultValue={initial?.priority ?? "medium"}
                options={PRIORITY_OPTS}
              />
            </Field>
            <Field label="Due date" error={errors.due_date}>
              <Input
                type="date"
                name="due_date"
                defaultValue={initial?.due_date ?? ""}
              />
            </Field>
          </div>
          {errors._form && (
            <p className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-300">
              {errors._form}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
