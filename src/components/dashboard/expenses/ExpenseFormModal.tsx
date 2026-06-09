"use client";
import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import Field from "@/components/form/Field";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/TextArea";
import NativeSelect from "@/components/form/NativeSelect";
import ReceiptUpload from "@/components/dashboard/expenses/ReceiptUpload";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  createExpenseAction,
  updateExpenseAction,
} from "@/app/dashboard/expenses/actions";
import type { Expense } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: Expense | null;
  onSaved?: () => void;
}

const CATEGORIES = [
  { label: "Marketing", value: "marketing" },
  { label: "Software", value: "software" },
  { label: "Hosting", value: "hosting" },
  { label: "Travel", value: "travel" },
  { label: "Payroll", value: "payroll" },
  { label: "Operations", value: "operations" },
  { label: "Other", value: "other" },
];

export default function ExpenseFormModal({
  isOpen,
  onClose,
  initial,
  onSaved,
}: Props) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(
    initial?.receipt_url ?? null
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      vendor: fd.get("vendor"),
      category: fd.get("category"),
      amount: fd.get("amount"),
      spent_at: fd.get("spent_at"),
      notes: fd.get("notes"),
      receipt_url: receiptUrl ?? "",
    };
    setErrors({});
    startTransition(async () => {
      const res = isEdit
        ? await updateExpenseAction(initial!.id, data)
        : await createExpenseAction(data);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(isEdit ? "Expense updated" : "Expense added");
      onSaved?.();
      onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-xl">
      <div className="p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit expense" : "New expense"}
        </h3>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vendor / title" required error={errors.vendor}>
              <Input name="vendor" defaultValue={initial?.vendor ?? ""} />
            </Field>
            <Field label="Amount" required error={errors.amount}>
              <Input
                type="number"
                name="amount"
                defaultValue={initial?.amount ?? ""}
                step={0.01}
                min="0"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" required error={errors.category}>
              <NativeSelect
                name="category"
                defaultValue={initial?.category ?? "operations"}
                options={CATEGORIES}
              />
            </Field>
            <Field label="Date" required error={errors.spent_at}>
              <Input
                type="date"
                name="spent_at"
                defaultValue={
                  initial?.spent_at ??
                  new Date().toISOString().slice(0, 10)
                }
              />
            </Field>
          </div>
          <Field label="Notes" error={errors.notes}>
            <TextArea name="notes" defaultValue={initial?.notes ?? ""} />
          </Field>
          <Field label="Receipt" hint="Image or PDF · stored in Supabase Storage">
            <ReceiptUpload value={receiptUrl} onChange={setReceiptUrl} />
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
