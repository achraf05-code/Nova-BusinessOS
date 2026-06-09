/**
 * Tenant-safe helpers for emitting activity log entries and notifications.
 *
 * Both helpers respect the active company and write through Supabase when
 * configured, and fall back to the in-memory demoStore otherwise. Failures
 * are swallowed — observability events should never break the primary
 * mutation that triggered them.
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow, newId, DEMO } from "@/lib/demoStore";
import type {
  ActivityLog,
  Json,
  Notification,
} from "@/types/database";

export async function logActivity(input: {
  companyId: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Json | null;
}): Promise<void> {
  if (!supabaseConfigured) {
    const store = getStore();
    const entry: ActivityLog = {
      id: newId(),
      company_id: input.companyId,
      actor_id: input.actorId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? null,
      created_at: isoNow(),
    };
    store.activity.unshift(entry);
    return;
  }
  try {
    const supabase = await createClient();
    await supabase.from("activity_logs").insert({
      company_id: input.companyId,
      actor_id: input.actorId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? null,
    } as never);
  } catch {
    /* swallow */
  }
}

export async function notify(input: {
  companyId: string;
  userId: string;
  type: Notification["type"];
  title: string;
  body?: string | null;
  href?: string | null;
}): Promise<void> {
  if (!supabaseConfigured) {
    const store = getStore();
    const entry: Notification = {
      id: newId(),
      company_id: input.companyId,
      user_id: input.userId,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
      type: input.type,
      read_at: null,
      created_at: isoNow(),
    };
    store.notifications.unshift(entry);
    return;
  }
  try {
    const supabase = await createClient();
    await supabase.from("notifications").insert({
      company_id: input.companyId,
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    } as never);
  } catch {
    /* swallow */
  }
}

/**
 * Fan a notification out to every member of a company. Used for events
 * that affect the whole workspace (e.g. AI CFO report, employee added).
 */
export async function notifyCompany(input: {
  companyId: string;
  type: Notification["type"];
  title: string;
  body?: string | null;
  href?: string | null;
}): Promise<void> {
  if (!supabaseConfigured) {
    return notify({ ...input, userId: DEMO.USER_ID });
  }
  try {
    const supabase = await createClient();
    const { data: members } = await supabase
      .from("company_members")
      .select("user_id")
      .eq("company_id", input.companyId);
    const list = (members ?? []) as { user_id: string }[];
    if (list.length === 0) return;
    const rows = list.map((m) => ({
      company_id: input.companyId,
      user_id: m.user_id,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    }));
    await supabase.from("notifications").insert(rows as never);
  } catch {
    /* swallow */
  }
}
