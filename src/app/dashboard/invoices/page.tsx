import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import {
  listContacts,
  listInvoices,
  getInvoice,
} from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import { formatCurrency } from "@/lib/format";
import {
  DocsIcon,
  DollarLineIcon,
  BoxIconLine,
  ShootingStarIcon,
} from "@/icons";
import InvoicesWorkspace from "@/components/dashboard/invoices/InvoicesWorkspace";
import type { InvoiceItem } from "@/types/database";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const ctx = await requireActiveCompany();
  const [invoices, contacts] = await Promise.all([
    listInvoices(ctx.company.id),
    listContacts(ctx.company.id),
  ]);

  const itemsById: Record<string, InvoiceItem[]> = {};
  await Promise.all(
    invoices.map(async (inv) => {
      const got = await getInvoice(ctx.company.id, inv.id);
      itemsById[inv.id] = got?.items ?? [];
    })
  );

  const paid = invoices.filter((i) => i.status === "paid");
  const sent = invoices.filter((i) => i.status === "sent");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const sumPaid = paid.reduce((s, i) => s + i.total, 0);
  const sumOutstanding = sent.reduce((s, i) => s + i.total, 0);
  const sumOverdue = overdue.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoicing"
        description="Quotes, invoices and payments. PDF export, tax support and brand controls."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Paid"
          value={formatCurrency(sumPaid, ctx.company.currency)}
          icon={<ShootingStarIcon />}
        />
        <KpiCard
          label="Outstanding"
          value={formatCurrency(sumOutstanding, ctx.company.currency)}
          icon={<DocsIcon />}
        />
        <KpiCard
          label="Overdue"
          value={formatCurrency(sumOverdue, ctx.company.currency)}
          delta={{ value: `${overdue.length} late`, positive: false }}
          icon={<BoxIconLine />}
        />
        <KpiCard
          label="All-time"
          value={formatCurrency(
            invoices.reduce((s, i) => s + i.total, 0),
            ctx.company.currency
          )}
          icon={<DollarLineIcon />}
        />
      </div>

      <InvoicesWorkspace
        invoices={invoices}
        itemsById={itemsById}
        contacts={contacts}
        company={{
          name: ctx.company.name,
          currency: ctx.company.currency,
        }}
      />
    </div>
  );
}
