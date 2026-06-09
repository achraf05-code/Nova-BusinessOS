"use client";
import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CrmContact, CrmDeal, LeadStage } from "@/types/database";
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
import ContactFormModal from "@/components/dashboard/crm/ContactFormModal";
import DealFormModal from "@/components/dashboard/crm/DealFormModal";
import PipelineBoardDnd from "@/components/dashboard/crm/PipelineBoardDnd";
import {
  deleteContactAction,
  deleteDealAction,
} from "@/app/dashboard/crm/actions";
import { PencilIcon, TrashBinIcon } from "@/icons";

interface Props {
  deals: CrmDeal[];
  contacts: CrmContact[];
}

export default function CrmWorkspace({ deals, contacts }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();

  const [dealForm, setDealForm] = useState<{
    open: boolean;
    initial: CrmDeal | null;
    defaultStage: LeadStage;
  }>({ open: false, initial: null, defaultStage: "lead" });

  const [contactForm, setContactForm] = useState<{
    open: boolean;
    initial: CrmContact | null;
  }>({ open: false, initial: null });

  const [confirmDeal, setConfirmDeal] = useState<CrmDeal | null>(null);
  const [confirmContact, setConfirmContact] = useState<CrmContact | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.company_name ?? "").toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const refresh = () => router.refresh();

  const onDeleteDeal = (d: CrmDeal) => setConfirmDeal(d);
  const onDeleteContact = (c: CrmContact) => setConfirmContact(c);

  const confirmDeleteDeal = () => {
    if (!confirmDeal) return;
    const id = confirmDeal.id;
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteDealAction(id);
      setDeleting(false);
      if (!res.ok) {
        toast.error("Couldn't delete deal", res.error);
      } else {
        toast.success("Deal deleted");
        refresh();
      }
      setConfirmDeal(null);
    });
  };

  const confirmDeleteContact = () => {
    if (!confirmContact) return;
    const id = confirmContact.id;
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteContactAction(id);
      setDeleting(false);
      if (!res.ok) {
        toast.error("Couldn't delete contact", res.error);
      } else {
        toast.success("Contact deleted");
        refresh();
      }
      setConfirmContact(null);
    });
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            setContactForm({ open: true, initial: null })
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          + Contact
        </button>
        <button
          type="button"
          onClick={() =>
            setDealForm({ open: true, initial: null, defaultStage: "lead" })
          }
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New deal
        </button>
      </div>

      <PipelineBoardDnd
        deals={deals}
        onEdit={(deal) =>
          setDealForm({ open: true, initial: deal, defaultStage: deal.stage })
        }
        onDelete={onDeleteDeal}
        onAddInStage={(stage) =>
          setDealForm({ open: true, initial: null, defaultStage: stage })
        }
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Contacts
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {contacts.length} total
            </p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts…"
            className="h-10 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <Th>Name</Th>
                <Th>Company</Th>
                <Th>Title</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th className="text-right">Actions</Th>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredContacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {c.full_name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {c.company_name ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {c.title ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {c.email ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {c.phone ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setContactForm({ open: true, initial: c })
                        }
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                        aria-label="Edit contact"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteContact(c)}
                        className="rounded p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
                        aria-label="Delete contact"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredContacts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No contacts match. Try clearing the search or add a new
                    contact.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DealFormModal
        isOpen={dealForm.open}
        onClose={() =>
          setDealForm({ open: false, initial: null, defaultStage: "lead" })
        }
        initial={dealForm.initial}
        contacts={contacts}
        defaultStage={dealForm.defaultStage}
        onSaved={refresh}
      />
      <ContactFormModal
        isOpen={contactForm.open}
        onClose={() => setContactForm({ open: false, initial: null })}
        initial={contactForm.initial}
        onSaved={refresh}
      />
      <ConfirmDialog
        isOpen={Boolean(confirmDeal)}
        title={`Delete deal ${confirmDeal?.title ?? ""}?`}
        description="This is permanent. Activity history will be retained."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDeleteDeal}
        onClose={() => setConfirmDeal(null)}
      />
      <ConfirmDialog
        isOpen={Boolean(confirmContact)}
        title={`Delete contact ${confirmContact?.full_name ?? ""}?`}
        description="Their associated deals will be kept (without a contact)."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDeleteContact}
        onClose={() => setConfirmContact(null)}
      />
      {/* Suppress badge unused warning when no deal is selected */}
      {false && <Badge>noop</Badge>}
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
