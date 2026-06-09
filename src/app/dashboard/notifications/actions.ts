"use server";

import { withAction, actionOk, actionFail } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow } from "@/lib/demoStore";

const PATHS = ["/dashboard/notifications", "/dashboard/activity", "/dashboard"];

export async function markNotificationReadAction(id: string) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() } as never)
        .eq("id", id)
        .eq("user_id", ctx.user.id);
      if (error) return actionFail(error.message);
    } else {
      const n = getStore().notifications.find(
        (n) => n.id === id && n.user_id === ctx.user.id
      );
      if (!n) return actionFail("Notification not found");
      n.read_at = isoNow();
    }
    return actionOk({ id });
  });
}

export async function markAllNotificationsReadAction() {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() } as never)
        .is("read_at", null)
        .eq("user_id", ctx.user.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const now = isoNow();
      for (const n of store.notifications) {
        if (n.user_id === ctx.user.id && !n.read_at) n.read_at = now;
      }
    }
    return actionOk({ ok: true });
  });
}

export async function updateNotificationPreferencesAction(
  patch: Record<string, unknown>
) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const norm = {
      email_ai_cfo_reports:
        patch.email_ai_cfo_reports === true ||
        patch.email_ai_cfo_reports === "on",
      email_invoice_paid:
        patch.email_invoice_paid === true ||
        patch.email_invoice_paid === "on",
      email_invitations:
        patch.email_invitations === true || patch.email_invitations === "on",
    };
    if (supabaseConfigured) {
      const supabase = await createClient();
      await supabase
        .from("notification_preferences")
        .upsert({ user_id: ctx.user.id, ...norm } as never, {
          onConflict: "user_id",
        } as never);
    } else {
      const store = getStore();
      let row = store.preferences.find((p) => p.user_id === ctx.user.id);
      if (!row) {
        row = {
          user_id: ctx.user.id,
          email_ai_cfo_reports: true,
          email_invoice_paid: true,
          email_invitations: true,
          updated_at: isoNow(),
        };
        store.preferences.push(row);
      }
      Object.assign(row, norm, { updated_at: isoNow() });
    }
    return actionOk({ ok: true });
  });
}
