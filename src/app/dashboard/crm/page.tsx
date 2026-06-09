import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import { listDeals, listContacts } from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import { formatCurrency } from "@/lib/format";
import {
  GroupIcon,
  DollarLineIcon,
  ShootingStarIcon,
  TaskIcon,
} from "@/icons";
import CrmWorkspace from "@/components/dashboard/crm/CrmWorkspace";

export const metadata: Metadata = { title: "CRM" };

export default async function CrmPage() {
  const ctx = await requireActiveCompany();
  const [deals, contacts] = await Promise.all([
    listDeals(ctx.company.id),
    listContacts(ctx.company.id),
  ]);

  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const won = deals.filter((d) => d.stage === "won");
  const lost = deals.filter((d) => d.stage === "lost").length;
  const wonValue = won.reduce((s, d) => s + d.value, 0);
  const pipelineValue = open.reduce((s, d) => s + d.value, 0);
  const winRate =
    won.length + lost === 0
      ? 0
      : Math.round((won.length / (won.length + lost)) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Lead management, pipeline, contacts and activities — built for B2B teams."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Pipeline value"
          value={formatCurrency(pipelineValue, ctx.company.currency)}
          icon={<DollarLineIcon />}
        />
        <KpiCard
          label="Open deals"
          value={String(open.length)}
          icon={<TaskIcon />}
        />
        <KpiCard
          label="Won this period"
          value={formatCurrency(wonValue, ctx.company.currency)}
          delta={{ value: `${won.length} deals`, positive: true }}
          icon={<ShootingStarIcon />}
        />
        <KpiCard label="Win rate" value={`${winRate}%`} icon={<GroupIcon />} />
      </div>

      <CrmWorkspace deals={deals} contacts={contacts} />
    </div>
  );
}
