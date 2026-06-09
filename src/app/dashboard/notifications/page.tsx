import type { Metadata } from "next";
import { requireActiveCompany } from "@/lib/tenant";
import {
  getNotificationPreferences,
  listFullNotifications,
} from "@/lib/queries";
import PageHeader from "@/components/dashboard/PageHeader";
import NotificationsCenter from "@/components/dashboard/notifications/NotificationsCenter";

export const metadata: Metadata = { title: "Notifications" };

interface PageProps {
  searchParams: Promise<{ page?: string; type?: string; status?: string }>;
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  const ctx = await requireActiveCompany();
  const { page = "1", type, status } = await searchParams;
  const [items, prefs] = await Promise.all([
    listFullNotifications(),
    getNotificationPreferences(ctx.user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Mark items as read, filter by type, and manage email digests."
      />
      <NotificationsCenter
        items={items}
        preferences={prefs}
        currentPage={Math.max(1, Number(page) || 1)}
        currentType={type ?? "all"}
        currentStatus={status ?? "all"}
      />
    </div>
  );
}
