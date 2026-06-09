"use client";
import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import Field from "@/components/form/Field";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/TextArea";
import {
  createContactAction,
  updateContactAction,
} from "@/app/dashboard/crm/actions";
import { useToast } from "@/components/ui/toast/ToastProvider";
import type { CrmContact } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: CrmContact | null;
  onSaved?: () => void;
}

export default function ContactFormModal({
  isOpen,
  onClose,
  initial,
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
      const action = isEdit
        ? updateContactAction(initial!.id, data)
        : createContactAction(data);
      const res = await action;
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(isEdit ? "Contact updated" : "Contact added");
      onSaved?.();
      onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-xl">
      <div className="p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit contact" : "New contact"}
        </h3>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <Field label="Full name" required error={errors.full_name}>
            <Input
              name="full_name"
              defaultValue={initial?.full_name}
              placeholder="Jane Doe"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                name="email"
                defaultValue={initial?.email ?? ""}
                placeholder="jane@company.com"
              />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <Input
                name="phone"
                defaultValue={initial?.phone ?? ""}
                placeholder="+1 555 …"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company" error={errors.company_name}>
              <Input
                name="company_name"
                defaultValue={initial?.company_name ?? ""}
              />
            </Field>
            <Field label="Title" error={errors.title}>
              <Input name="title" defaultValue={initial?.title ?? ""} />
            </Field>
          </div>
          <Field label="Notes" error={errors.notes}>
            <TextArea name="notes" defaultValue={initial?.notes ?? ""} />
          </Field>
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
