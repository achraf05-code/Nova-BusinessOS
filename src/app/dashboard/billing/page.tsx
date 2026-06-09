import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireActiveCompany, hasRole } from "@/lib/tenant";
import { getCompanyUsage } from "@/lib/usage";
import { stripeConfigured } from "@/lib/stripe";
import PageHeader from "@/components/dashboard/PageHeader";
import BillingWorkspace from "@/components/dashboard/billing/BillingWorkspace";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const ctx = await requireActiveCompany();
  if (!hasRole(ctx.role, "admin")) {
    redirect("/dashboard/settings");
  }
  const usage = await getCompanyUsage(ctx.company.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription, usage and payment history."
      />
      <BillingWorkspace
        usage={usage}
        currency={ctx.company.currency}
        stripeReady={stripeConfigured()}
      />
    </div>
  );
}
