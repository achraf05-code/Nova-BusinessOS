import { redirect } from "next/navigation";
import React from "react";
import DashboardShell from "@/layout/DashboardShell";
import { getActiveCompany } from "@/lib/tenant";

// Every dashboard page reads the auth cookie + active-company cookie via
// `getActiveCompany()`. Force the dynamic runtime explicitly so Vercel never
// tries to statically prerender any /dashboard/* route.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getActiveCompany();
  if (!ctx) {
    redirect("/onboarding/company");
  }

  return (
    <DashboardShell
      user={{
        name: ctx.user.email?.split("@")[0] ?? "Nova User",
        email: ctx.user.email ?? "",
      }}
      company={{ id: ctx.company.id, name: ctx.company.name }}
      companies={ctx.companies.map((c) => ({ id: c.id, name: c.name }))}
    >
      {children}
    </DashboardShell>
  );
}
