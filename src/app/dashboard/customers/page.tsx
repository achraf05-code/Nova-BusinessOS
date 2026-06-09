import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveCompany } from "@/lib/tenant";
import { listContacts, listInvoices } from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const ctx = await requireActiveCompany();
  const [contacts, invoices] = await Promise.all([
    listContacts(ctx.company.id),
    listInvoices(ctx.company.id),
  ]);

  // Roll-up by contact
  const byContact = new Map<
    string,
    { invoices: number; paid: number; outstanding: number; overdue: number }
  >();
  for (const inv of invoices) {
    if (!inv.contact_id) continue;
    const row = byContact.get(inv.contact_id) ?? {
      invoices: 0,
      paid: 0,
      outstanding: 0,
      overdue: 0,
    };
    row.invoices += 1;
    if (inv.status === "paid") row.paid += inv.total;
    else if (inv.status === "sent") row.outstanding += inv.total;
    else if (inv.status === "overdue") row.overdue += inv.total;
    byContact.set(inv.contact_id, row);
  }

  // Free-text invoices (no linked contact) get bucketed under their notes
  const freeInvoices = invoices.filter((i) => !i.contact_id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Customer records, invoices and payment history — linked to your CRM contacts."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Customers
        </h3>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <Th>Customer</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Invoices</Th>
                <Th>Paid</Th>
                <Th>Outstanding</Th>
                <Th>Overdue</Th>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {contacts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Add CRM contacts to start tracking customers.
                  </TableCell>
                </TableRow>
              )}
              {contacts.map((c) => {
                const stats = byContact.get(c.id) ?? {
                  invoices: 0,
                  paid: 0,
                  outstanding: 0,
                  overdue: 0,
                };
                return (
                  <TableRow key={c.id}>
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {c.full_name
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <p>{c.full_name}</p>
                          {c.company_name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {c.company_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {c.email ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {c.phone ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {stats.invoices}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(stats.paid, ctx.company.currency)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(stats.outstanding, ctx.company.currency)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {stats.overdue > 0 ? (
                        <Badge size="sm" color="error">
                          {formatCurrency(stats.overdue, ctx.company.currency)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Manage contact details from{" "}
          <Link href="/dashboard/crm" className="text-brand-500 hover:text-brand-600">
            the CRM module
          </Link>
          .
        </div>
      </div>

      {freeInvoices.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Invoices not yet linked to a customer
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Edit these invoices and select a CRM contact to link them.
          </p>
          <ul className="mt-4 divide-y divide-gray-100 text-sm dark:divide-gray-800">
            {freeInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-3">
                <span className="font-medium text-gray-800 dark:text-white">
                  #{inv.number}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {inv.notes ?? "—"}
                </span>
                <span className="font-medium">
                  {formatCurrency(inv.total, inv.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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
