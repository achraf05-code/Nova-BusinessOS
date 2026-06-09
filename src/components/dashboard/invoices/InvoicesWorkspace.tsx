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
import InvoiceFormModal from "@/components/dashboard/invoices/InvoiceFormModal";
import {
  deleteInvoiceAction,
  setInvoiceStatusAction,
} from "@/app/dashboard/invoices/actions";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  CrmContact,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
} from "@/types/database";
import { PencilIcon, TrashBinIcon, DownloadIcon, MoreDotIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

interface Props {
  invoices: Invoice[];
  itemsById: Record<string, InvoiceItem[]>;
  contacts: CrmContact[];
  company: { name: string; currency: string };
}

const STATUS_COLOR: Record<InvoiceStatus, "light" | "warning" | "success" | "error" | "dark"> = {
  draft: "light",
  sent: "warning",
  paid: "success",
  overdue: "error",
  cancelled: "dark",
};
const STATUS_NEXT: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["paid", "overdue", "cancelled"],
  paid: ["sent"],
  overdue: ["paid", "cancelled"],
  cancelled: ["draft"],
};

export default function InvoicesWorkspace({
  invoices,
  itemsById,
  contacts,
  company,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [form, setForm] = useState<{
    open: boolean;
    initial: { invoice: Invoice; items: InvoiceItem[] } | null;
  }>({ open: false, initial: null });
  const [confirm, setConfirm] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => router.refresh();

  const onDelete = (inv: Invoice) => setConfirm(inv);
  const confirmDelete = () => {
    if (!confirm) return;
    const id = confirm.id;
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteInvoiceAction(id);
      setDeleting(false);
      if (!res.ok) toast.error("Couldn't delete invoice", res.error);
      else {
        toast.success("Invoice deleted");
        refresh();
      }
      setConfirm(null);
    });
  };

  const setStatus = (inv: Invoice, status: InvoiceStatus) => {
    startTransition(async () => {
      const res = await setInvoiceStatusAction(inv.id, status);
      if (!res.ok) toast.error("Couldn't update status", res.error);
      else {
        toast.success(`Marked as ${status}`);
        refresh();
      }
    });
  };

  const downloadPdf = (inv: Invoice) => {
    try {
      const items = itemsById[inv.id] ?? [
        {
          id: "auto",
          invoice_id: inv.id,
          description: inv.notes ?? "Services",
          quantity: 1,
          unit_price: inv.subtotal || inv.total,
          amount: inv.subtotal || inv.total,
          position: 0,
        },
      ];
      downloadInvoicePdf({
        invoice: inv,
        items,
        company: { name: company.name, currency: company.currency },
        clientLabel: inv.notes,
      });
      toast.success(`Downloaded invoice ${inv.number}.pdf`);
    } catch (err) {
      toast.error(
        "PDF generation failed",
        err instanceof Error ? err.message : undefined
      );
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setForm({ open: true, initial: null })}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New invoice
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Invoices
        </h3>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <Th>#</Th>
                <Th>Client</Th>
                <Th>Issued</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    #{inv.number}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {inv.notes ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(inv.issue_date)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatCurrency(inv.total, inv.currency)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge size="sm" color={STATUS_COLOR[inv.status]}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => downloadPdf(inv)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                        aria-label="Download PDF"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            open: true,
                            initial: { invoice: inv, items: itemsById[inv.id] ?? [] },
                          })
                        }
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                        aria-label="Edit invoice"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(inv)}
                        className="rounded p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
                        aria-label="Delete invoice"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === inv.id ? null : inv.id);
                          }}
                          className="dropdown-toggle rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                          aria-label="More"
                        >
                          <MoreDotIcon className="h-4 w-4" />
                        </button>
                        <Dropdown
                          isOpen={openMenu === inv.id}
                          onClose={() => setOpenMenu(null)}
                          className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
                        >
                          <div className="px-2 pb-1 pt-2 text-[10px] uppercase tracking-wider text-gray-400">
                            Set status
                          </div>
                          {STATUS_NEXT[inv.status].map((s) => (
                            <DropdownItem
                              key={s}
                              onItemClick={() => {
                                setOpenMenu(null);
                                setStatus(inv, s);
                              }}
                              className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                            >
                              Mark as {s}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No invoices yet. Create your first one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <InvoiceFormModal
        isOpen={form.open}
        onClose={() => setForm({ open: false, initial: null })}
        initial={form.initial}
        contacts={contacts}
        currency={company.currency}
        onSaved={refresh}
      />
      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title={`Delete invoice #${confirm?.number ?? ""}?`}
        description="This permanently removes the invoice and its line items."
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
