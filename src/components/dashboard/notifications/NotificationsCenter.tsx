"use client";
import React, { useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  updateNotificationPreferencesAction,
} from "@/app/dashboard/notifications/actions";
import { formatDateTime } from "@/lib/format";
import Badge from "@/components/ui/badge/Badge";
import type { Notification, NotificationPreferences } from "@/types/database";

interface Props {
  items: Pick<
    Notification,
    "id" | "title" | "body" | "type" | "created_at" | "href" | "read_at"
  >[];
  preferences: NotificationPreferences;
  currentPage: number;
  currentType: string;
  currentStatus: string;
}

const PAGE_SIZE = 12;

const TYPE_TONE: Record<string, string> = {
  invoice_paid: "bg-success-500",
  task_assigned: "bg-brand-500",
  lead_won: "bg-warning-500",
  new_employee: "bg-blue-light-500",
  ai_insight: "bg-theme-purple-500",
  system: "bg-gray-400",
};

const TYPE_LABELS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "invoice_paid", label: "Invoice paid" },
  { value: "task_assigned", label: "Task assigned" },
  { value: "lead_won", label: "Lead won" },
  { value: "ai_insight", label: "AI CFO" },
  { value: "system", label: "System" },
];

export default function NotificationsCenter({
  items,
  preferences,
  currentPage,
  currentType,
  currentStatus,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const toast = useToast();
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (currentType !== "all" && n.type !== currentType) return false;
      if (currentStatus === "unread" && n.read_at) return false;
      if (currentStatus === "read" && !n.read_at) return false;
      return true;
    });
  }, [items, currentType, currentStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const sliced = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unread = items.filter((n) => !n.read_at).length;

  const setQuery = (key: string, value: string | null) => {
    const sp = new URLSearchParams(params?.toString());
    if (!value || value === "all") sp.delete(key);
    else sp.set(key, value);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  };

  const setPage = (p: number) => {
    const sp = new URLSearchParams(params?.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`);
  };

  const markRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationReadAction(id);
      if (!res.ok) toast.error(res.error);
    });
  };
  const markAll = () => {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction();
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("All notifications marked as read");
        router.refresh();
      }
    });
  };

  const onPrefs = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    startTransition(async () => {
      const res = await updateNotificationPreferencesAction(data);
      if (!res.ok) toast.error(res.error);
      else toast.success("Preferences saved");
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Inbox
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {unread} unread · {items.length} total
              </p>
            </div>
            <button
              type="button"
              onClick={markAll}
              disabled={unread === 0}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Mark all as read
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {TYPE_LABELS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setQuery("type", t.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  currentType === t.value
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
                    : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="mx-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
            {[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
              { value: "read", label: "Read" },
            ].map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setQuery("status", s.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  currentStatus === s.value
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
                    : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <ul className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
            {sliced.length === 0 && (
              <li className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Nothing to show with this filter.
              </li>
            )}
            {sliced.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 py-4 ${
                  n.read_at ? "" : "bg-brand-50/30 dark:bg-brand-500/5"
                } -mx-2 rounded-lg px-2`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    TYPE_TONE[n.type] ?? TYPE_TONE.system
                  }`}
                />
                <div className="grow">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {n.title}
                    </p>
                    {!n.read_at && (
                      <Badge size="sm" color="primary">
                        new
                      </Badge>
                    )}
                  </div>
                  {n.body && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTime(n.created_at)}
                  </p>
                </div>
                {!n.read_at && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={onPrefs}
        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
      >
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Email preferences
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Control which Nova events arrive in your inbox.
        </p>
        <div className="mt-5 space-y-3">
          <Toggle
            name="email_ai_cfo_reports"
            label="Weekly AI CFO digest"
            defaultChecked={preferences.email_ai_cfo_reports}
          />
          <Toggle
            name="email_invoice_paid"
            label="Invoice paid confirmations"
            defaultChecked={preferences.email_invoice_paid}
          />
          <Toggle
            name="email_invitations"
            label="Team invitations"
            defaultChecked={preferences.email_invitations}
          />
        </div>
        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Save preferences
        </button>
      </form>
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5">
      <span>{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-300 transition checked:bg-brand-500 dark:bg-gray-700 dark:checked:bg-brand-500"
        style={{
          backgroundImage:
            "radial-gradient(circle 8px at 4px 50%, white 100%, transparent 100%)",
        }}
      />
    </label>
  );
}
