"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow, newId, DEMO } from "@/lib/demoStore";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email/templates";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/tenant";
import { nova } from "@/config/nova";
import type { TeamInvitation } from "@/types/database";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? nova.url;

/**
 * Accept a pending team invitation. Requires the invited user to already
 * be authenticated (the page redirects to /register?next=… if not).
 */
export async function acceptInvitationAction(token: string) {
  // ---- Demo mode ----
  if (!supabaseConfigured) {
    const store = getStore();
    const inv = store.invitations.find((i) => i.token === token);
    if (!inv) return { ok: false as const, error: "Invitation not found" };
    if (inv.accepted_at)
      return { ok: false as const, error: "Already accepted" };
    if (new Date(inv.expires_at).getTime() < Date.now())
      return { ok: false as const, error: "Invitation expired" };
    inv.accepted_at = isoNow();
    // demo workspace: ensure an employee row exists
    store.employees.push({
      id: newId(),
      company_id: inv.company_id,
      user_id: DEMO.USER_ID,
      full_name: inv.email.split("@")[0],
      email: inv.email,
      role_title: inv.role,
      department: null,
      hired_at: null,
      status: "active",
      created_at: isoNow(),
      updated_at: isoNow(),
    });
    await logActivity({
      companyId: inv.company_id,
      actorId: DEMO.USER_ID,
      action: "invitation.accepted",
      entityType: "team_invitation",
      entityId: inv.id,
      metadata: { email: inv.email, role: inv.role },
    });
    const c = await cookies();
    c.set(ACTIVE_COMPANY_COOKIE, inv.company_id, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    redirect("/dashboard");
  }

  // ---- Real Supabase ----
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/register?next=/invite/${token}`);
  }

  const { data: inv } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  const invitation = inv as TeamInvitation | null;
  if (!invitation) return { ok: false as const, error: "Invitation not found" };
  if (invitation.accepted_at)
    return { ok: false as const, error: "Already accepted" };
  if (new Date(invitation.expires_at).getTime() < Date.now())
    return { ok: false as const, error: "Invitation expired" };

  const { error: memErr } = await supabase
    .from("company_members")
    .insert({
      company_id: invitation.company_id,
      user_id: user.id,
      role: invitation.role,
    } as never);
  if (memErr && !memErr.message.toLowerCase().includes("duplicate")) {
    return { ok: false as const, error: memErr.message };
  }

  await supabase
    .from("team_invitations")
    .update({ accepted_at: new Date().toISOString() } as never)
    .eq("id", invitation.id);

  // Welcome email
  const { data: companyRow } = await supabase
    .from("companies")
    .select("name")
    .eq("id", invitation.company_id)
    .maybeSingle();
  const companyName =
    (companyRow as { name?: string } | null)?.name ?? "your team";
  const tpl = welcomeEmail({
    fullName:
      (user.user_metadata?.full_name as string | undefined) ?? null,
    companyName,
    dashboardUrl: `${APP_URL}/dashboard`,
  });
  await sendEmail({
    to: user.email ?? invitation.email,
    subject: tpl.subject,
    html: tpl.html,
    template: "welcome",
  });

  await logActivity({
    companyId: invitation.company_id,
    actorId: user.id,
    action: "invitation.accepted",
    entityType: "team_invitation",
    entityId: invitation.id,
    metadata: { email: invitation.email, role: invitation.role },
  });

  const c = await cookies();
  c.set(ACTIVE_COMPANY_COOKIE, invitation.company_id, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/dashboard");
}
