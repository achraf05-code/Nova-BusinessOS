"use client";
import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import Field from "@/components/form/Field";
import Input from "@/components/form/input/InputField";
import NativeSelect from "@/components/form/NativeSelect";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  createDealAction,
  updateDealAction,
} from "@/app/dashboard/crm/actions";
import type { CrmContact, CrmDeal, LeadStage } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: CrmDeal | null;
  contacts: CrmContact[];
  defaultStage?: LeadStage;
  onSaved?: () => void;
}

const STAGES: { label: string; value: LeadStage }[] = [
  { label: "Lead", value: "lead" },
  { label: "Contacted", value: "contacted" },
  { label: "Meeting", value: "meeting" },
  { label: "Proposal", value: "proposal" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

export default function DealFormModal({
  isOpen,
  onClose,
  initial,
  contacts,
  defaultStage = "lead",
  onSaved,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const isEdit = Boolean(initial?.id);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title"),
      contact_id: fd.get("contact_id") || "",
      value: fd.get("value"),
      probability: fd.get("probability"),
      stage: fd.get("stage"),
      expected_close: fd.get("expected_close") || "",
    };
    setErrors({});
    startTransition(async () => {
      const res = isEdit
        ? await updateDealAction(initial!.id, data)
        : await createDealAction(data);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(isEdit ? "Deal updated" : "Deal added");
      onSaved?.();
      onClose();
    });
  };

  const contactOpts = [
    { label: "— None —", value: "" },
    ...contacts.map((c) => ({
      label: c.full_name + (c.company_name ? ` · ${c.company_name}` : ""),
      value: c.id,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-xl">
      <div className="p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit deal" : "New deal"}
        </h3>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <Field label="Title" required error={errors.title}>
            <Input
              name="title"
              defaultValue={initial?.title}
              placeholder="Acme — Annual Plan"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact" error={errors.contact_id}>
              <NativeSelect
                name="contact_id"
                defaultValue={initial?.contact_id ?? ""}
                options={contactOpts}
              />
            </Field>
            <Field label="Stage" required error={errors.stage}>
              <NativeSelect
                name="stage"
                defaultValue={initial?.stage ?? defaultStage}
                options={STAGES}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Value" required error={errors.value}>
              <Input
                type="number"
                name="value"
                defaultValue={initial?.value ?? 0}
                step={1}
                min="0"
              />
            </Field>
            <Field
              label="Probability %"
              required
              error={errors.probability}
              hint="0–100"
            >
              <Input
                type="number"
                name="probability"
                defaultValue={initial?.probability ?? 25}
                step={5}
                min="0"
                max="100"
              />
            </Field>
            <Field label="Expected close" error={errors.expected_close}>
              <Input
                type="date"
                name="expected_close"
                defaultValue={initial?.expected_close ?? ""}
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add deal"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
