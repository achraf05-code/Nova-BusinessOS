"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useToast } from "@/components/ui/toast/ToastProvider";
import ConfirmDialog from "@/components/ui/dialog/ConfirmDialog";
import ExpenseFormModal from "@/components/dashboard/expenses/ExpenseFormModal";
import { deleteExpenseAction } from "@/app/dashboard/expenses/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/types/database";
import { PencilIcon, TrashBinIcon } from "@/icons";
import ExpenseBreakdownChart from "@/components/dashboard/charts/ExpenseBreakdownChart";

interface Props {
  expenses: Expense[];
  currency: string;
}

const CATEGORY_COLOR: Record<string, "primary" | "info" | "warning" | "light" | "dark" | "success"> = {
  marketing: "primary",
  software: "info",
  hosting: "warning",
  travel: "light",
  payroll: "dark",
  operations: "success",
  other: "light",
};

export default function ExpensesWorkspace({ expenses, currency }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [form, setForm] = useState<{ open: boolean; initial: Expense | null }>(
    { open: false, initial: null }
  );
  const [confirm, setConfirm] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => router.refresh();

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const breakdown = Object.entries(byCategory).map(([label, value]) => ({
    label: label[0].toUpperCase() + label.slice(1),
    value,
  }));

  const onDelete = (e: Expense) => setConfirm(e);
  const confirmDelete = () => {
    if (!confirm) return;
    const id = confirm.id;
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteExpenseAction(id);
      setDeleting(false);
      if (!res.ok) toast.error("Couldn't delete expense", res.error);
      else {
        toast.success("Expense deleted");
        refresh();
      }
      setConfirm(null);
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setForm({ open: true, initial: null })}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New expense
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ExpenseBreakdownChart data={breakdown} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Recent expenses
          </h3>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <Th>Vendor</Th>
                  <Th>Category</Th>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Receipt</Th>
                  <Th className="text-right">Actions</Th>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {e.vendor}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={CATEGORY_COLOR[e.category] ?? "light"}>
                        {e.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(e.spent_at)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(e.amount, e.currency || currency)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      {e.receipt_url ? (
                        <a
                          href={e.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-500 hover:text-brand-600"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setForm({ open: true, initial: e })
                          }
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                          aria-label="Edit expense"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(e)}
                          className="rounded p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
                          aria-label="Delete expense"
                        >
                          <TrashBinIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No expenses yet. Add your first.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <ExpenseFormModal
        isOpen={form.open}
        onClose={() => setForm({ open: false, initial: null })}
        initial={form.initial}
        onSaved={refresh}
      />
      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title={`Delete expense ${confirm?.vendor ?? ""}?`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setConfirm(null)}
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
