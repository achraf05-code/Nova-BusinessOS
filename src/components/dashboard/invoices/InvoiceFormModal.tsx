"use client";
import React, { useMemo, useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import Field from "@/components/form/Field";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/TextArea";
import NativeSelect from "@/components/form/NativeSelect";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  createInvoiceAction,
  updateInvoiceAction,
} from "@/app/dashboard/invoices/actions";
import type {
  CrmContact,
  Invoice,
  InvoiceItem,
} from "@/types/database";
import { formatCurrency } from "@/lib/format";
import { TrashBinIcon } from "@/icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: { invoice: Invoice; items: InvoiceItem[] } | null;
  contacts: CrmContact[];
  currency: string;
  onSaved?: () => void;
}

interface ItemRow {
  description: string;
  quantity: number;
  unit_price: number;
}

const STATUS_OPTS = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
];

function suggestNumber() {
  const d = new Date();
  return `${d.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export default function InvoiceFormModal({
  isOpen,
  onClose,
  initial,
  contacts,
  currency,
  onSaved,
}: Props) {
  const isEdit = Boolean(initial?.invoice.id);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  const [number, setNumber] = useState(initial?.invoice.number ?? suggestNumber());
  const [contactId, setContactId] = useState(initial?.invoice.contact_id ?? "");
  const [clientLabel, setClientLabel] = useState(initial?.invoice.notes ?? "");
  const [status, setStatus] = useState(initial?.invoice.status ?? "draft");
  const [issueDate, setIssueDate] = useState(
    initial?.invoice.issue_date ?? new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(initial?.invoice.due_date ?? "");
  const [taxRate, setTaxRate] = useState(initial?.invoice.tax_rate ?? 0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>(
    initial?.items?.length
      ? initial.items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        }))
      : [{ description: "", quantity: 1, unit_price: 0 }]
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0),
      0
    );
    const tax = +(subtotal * (Number(taxRate) / 100)).toFixed(2);
    return { subtotal: +subtotal.toFixed(2), tax, total: +(subtotal + tax).toFixed(2) };
  }, [items, taxRate]);

  const updateItem = (idx: number, patch: Partial<ItemRow>) =>
    setItems((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const addItem = () =>
    setItems((rows) => [...rows, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (idx: number) =>
    setItems((rows) => (rows.length === 1 ? rows : rows.filter((_, i) => i !== idx)));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      number,
      contact_id: contactId,
      client_label: clientLabel,
      status,
      issue_date: issueDate,
      due_date: dueDate,
      tax_rate: taxRate,
      notes,
      items: items.map((r) => ({
        description: r.description,
        quantity: Number(r.quantity),
        unit_price: Number(r.unit_price),
      })),
    };
    setErrors({});
    startTransition(async () => {
      const res = isEdit
        ? await updateInvoiceAction(initial!.invoice.id, data)
        : await createInvoiceAction(data);
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(isEdit ? "Invoice updated" : "Invoice created");
      onSaved?.();
      onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-3xl">
      <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit invoice" : "New invoice"}
        </h3>
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Invoice #" required error={errors.number}>
              <Input
                name="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </Field>
            <Field label="Issue date" required error={errors.issue_date}>
              <Input
                type="date"
                name="issue_date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </Field>
            <Field label="Due date" error={errors.due_date}>
              <Input
                type="date"
                name="due_date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client (contact)" error={errors.contact_id}>
              <NativeSelect
                value={contactId}
                onChange={setContactId}
                options={[
                  { label: "— None —", value: "" },
                  ...contacts.map((c) => ({
                    label:
                      c.full_name +
                      (c.company_name ? ` · ${c.company_name}` : ""),
                    value: c.id,
                  })),
                ]}
              />
            </Field>
            <Field
              label="Or free-text client / notes"
              error={errors.client_label}
            >
              <Input
                value={clientLabel}
                onChange={(e) => setClientLabel(e.target.value)}
                placeholder="Acme Inc."
              />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Line items
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                + Add item
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 w-24">Qty</th>
                    <th className="px-3 py-2 w-32">Unit price</th>
                    <th className="px-3 py-2 w-28 text-right">Amount</th>
                    <th className="px-2 py-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <Input
                          value={it.description}
                          onChange={(e) =>
                            updateItem(idx, { description: e.target.value })
                          }
                          placeholder="Service or product"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          value={it.quantity}
                          onChange={(e) =>
                            updateItem(idx, {
                              quantity: Number(e.target.value),
                            })
                          }
                          min="0"
                          step={1}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          value={it.unit_price}
                          onChange={(e) =>
                            updateItem(idx, {
                              unit_price: Number(e.target.value),
                            })
                          }
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                        {formatCurrency(
                          Number(it.quantity || 0) * Number(it.unit_price || 0),
                          currency
                        )}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          aria-label="Remove item"
                          className="rounded p-1 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
                        >
                          <TrashBinIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.items && (
              <p className="mt-1 text-xs text-error-500">{errors.items}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tax rate (%)" error={errors.tax_rate}>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
            </Field>
            <Field label="Status" error={errors.status}>
              <NativeSelect
                value={status}
                onChange={(v) => setStatus(v as Invoice["status"])}
                options={STATUS_OPTS}
              />
            </Field>
          </div>

          <Field label="Notes" error={errors.notes}>
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Visible on the invoice (payment terms, references…)"
            />
          </Field>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-white/[0.02]">
            <Row label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
            <Row label={`Tax (${taxRate}%)`} value={formatCurrency(totals.tax, currency)} />
            <Row
              label="Total"
              value={formatCurrency(totals.total, currency)}
              bold
            />
          </div>

          {errors._form && (
            <p className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-300">
              {errors._form}
            </p>
          )}
          <div className="flex justify-end gap-2">
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
              {pending
                ? "Saving…"
                : isEdit
                ? "Save changes"
                : "Create invoice"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={`text-gray-800 dark:text-white ${
          bold ? "text-base font-semibold" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
