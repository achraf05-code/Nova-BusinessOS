"use client";
import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import Field from "@/components/form/Field";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/TextArea";
import NativeSelect from "@/components/form/NativeSelect";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  createProjectAction,
  updateProjectAction,
} from "@/app/dashboard/projects/actions";
import type { CrmContact, Project } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: Project | null;
  contacts: CrmContact[];
  onSaved?: () => void;
}

const STATUS_OPTS = [
  { label: "Planning", value: "planning" },
  { label: "In progress", value: "in_progress" },
  { label: "On hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function ProjectFormModal({
  isOpen,
  onClose,
  initial,
  contacts,
  onSaved,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const isEdit = Boolean(initial?.id);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    setErrors({});
    startTransition(async () => {
      const res = isEdit
        ? await updateProjectAction(initial!.id, data)
        : await createProjectAction(data);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(isEdit ? "Project updated" : "Project created");
      onSaved?.();
      onClose();
    });
  };

  const clientOpts = [
    { label: "— None —", value: "" },
    ...contacts.map((c) => ({
      label: c.full_name + (c.company_name ? ` · ${c.company_name}` : ""),
      value: c.id,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-2xl">
      <div className="p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit project" : "New project"}
        </h3>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <Field label="Project name" required error={errors.name}>
            <Input name="name" defaultValue={initial?.name} />
          </Field>
          <Field label="Description" error={errors.description}>
            <TextArea
              name="description"
              defaultValue={initial?.description ?? ""}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client" error={errors.client_id}>
              <NativeSelect
                name="client_id"
                defaultValue={initial?.client_id ?? ""}
                options={clientOpts}
              />
            </Field>
            <Field label="Status" error={errors.status}>
              <NativeSelect
                name="status"
                defaultValue={initial?.status ?? "planning"}
                options={STATUS_OPTS}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Budget" error={errors.budget}>
              <Input
                type="number"
                name="budget"
                defaultValue={initial?.budget ?? ""}
                step={1}
                min="0"
              />
            </Field>
            <Field label="Start date" error={errors.start_date}>
              <Input
                type="date"
                name="start_date"
                defaultValue={initial?.start_date ?? ""}
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
