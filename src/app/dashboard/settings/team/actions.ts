"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow, newId } from "@/lib/demoStore";
import { withAction, actionOk, actionFail } from "@/lib/actions";
import { flatFieldErrors } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email";
import { invitationEmail } from "@/lib/email/templates";
import { rateLimit } from "@/lib/rateLimit";
import { nova } from "@/config/nova";
import type { CompanyRole, TeamInvitation } from "@/types/database";

const PATHS = ["/dashboard/settings/team", "/dashboard/settings"];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? nova.url;

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["employee", "manager", "admin"]),
});

function generateToken() {
  // 256 bits of entropy, URL-safe
  const bytes = new Uint8Array(32);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Buffer.from(bytes)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export async function inviteTeamMemberAction(form: Record<string, unknown>) {
  return withAction(
    { revalidate: PATHS, requiredRole: "manager" },
    async (ctx) => {
      const limit = rateLimit(`invite:${ctx.user.id}`, {
        windowMs: 60 * 60 * 1000,
        max: 30,
      });
      if (!limit.ok) {
        return actionFail("Too many invitations sent recently. Try again later.");
      }
      const parsed = inviteSchema.safeParse(form);
      if (!parsed.success) {
        return actionFail("Invalid invitation", flatFieldErrors(parsed.error));
      }
      const { email, role } = parsed.data;

      const token = generateToken();
      const row = {
        company_id: ctx.company.id,
        email: email.toLowerCase(),
        role: role as CompanyRole,
        token,
        invited_by: ctx.user.id,
        expires_at: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      let invitation: TeamInvitation;
      if (supabaseConfigured) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("team_invitations")
          .insert(row as never)
          .select("*")
          .single();
        if (error || !data) return actionFail(error?.message ?? "Insert failed");
        invitation = data as TeamInvitation;
      } else {
        invitation = {
          id: newId(),
          ...row,
          accepted_at: null,
          created_at: isoNow(),
        } as TeamInvitation;
        getStore().invitations.unshift(invitation);
      }

      const acceptUrl = `${APP_URL}/invite/${invitation.token}`;
      const tpl = invitationEmail({
        companyName: ctx.company.name,
        inviterName: ctx.user.email ?? "Your teammate",
        role,
        acceptUrl,
      });
      await sendEmail({
        to: email,
        subject: tpl.subject,
        html: tpl.html,
        template: "invitation",
      });

      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "invitation.sent",
        entityType: "team_invitation",
        entityId: invitation.id,
        metadata: { email, role },
      });
      return actionOk(invitation);
    }
  );
}

export async function resendInvitationAction(id: string) {
  return withAction(
    { revalidate: PATHS, requiredRole: "manager" },
    async (ctx) => {
      const limit = rateLimit(`invite-resend:${ctx.user.id}`, {
        windowMs: 60 * 60 * 1000,
        max: 30,
      });
      if (!limit.ok) {
        return actionFail("Too many resends. Try again later.");
      }
      let invitation: TeamInvitation | null = null;
      if (supabaseConfigured) {
        const supabase = await createClient();
        const { data } = await supabase
          .from("team_invitations")
          .select("*")
          .eq("id", id)
          .eq("company_id", ctx.company.id)
          .maybeSingle();
        invitation = (data as unknown as TeamInvitation | null) ?? null;
      } else {
        invitation =
          getStore().invitations.find(
            (i) => i.id === id && i.company_id === ctx.company.id
          ) ?? null;
      }
      if (!invitation) return actionFail("Invitation not found");
      if (invitation.accepted_at) return actionFail("Invitation already accepted");

      const acceptUrl = `${APP_URL}/invite/${invitation.token}`;
      const tpl = invitationEmail({
        companyName: ctx.company.name,
        inviterName: ctx.user.email ?? "Your teammate",
        role: invitation.role,
        acceptUrl,
      });
      await sendEmail({
        to: invitation.email,
        subject: tpl.subject,
        html: tpl.html,
        template: "invitation",
      });

      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "invitation.resent",
        entityType: "team_invitation",
        entityId: invitation.id,
      });
      return actionOk({ id });
    }
  );
}

export async function cancelInvitationAction(id: string) {
  return withAction(
    { revalidate: PATHS, requiredRole: "manager" },
    async (ctx) => {
      if (supabaseConfigured) {
        const supabase = await createClient();
        const { error } = await supabase
          .from("team_invitations")
          .delete()
          .eq("id", id)
          .eq("company_id", ctx.company.id);
        if (error) return actionFail(error.message);
      } else {
        const store = getStore();
        const before = store.invitations.length;
        store.invitations = store.invitations.filter(
          (i) => !(i.id === id && i.company_id === ctx.company.id)
        );
        if (store.invitations.length === before)
          return actionFail("Invitation not found");
      }
      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "invitation.canceled",
        entityType: "team_invitation",
        entityId: id,
      });
      return actionOk({ id });
    }
  );
}
