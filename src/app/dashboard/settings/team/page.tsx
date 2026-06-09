import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireActiveCompany, hasRole } from "@/lib/tenant";
import { listEmployees, listInvitations } from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import TeamWorkspace from "@/components/dashboard/settings/TeamWorkspace";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const ctx = await requireActiveCompany();
  if (!hasRole(ctx.role, "manager")) {
    redirect("/dashboard/settings");
  }
  const [invitations, members] = await Promise.all([
    listInvitations(ctx.company.id),
    listEmployees(ctx.company.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Invite teammates, manage roles, and revoke access."
      />
      <TeamWorkspace invitations={invitations} members={members} />
    </div>
  );
}
