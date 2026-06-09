import type { Metadata } from "next";
import Calendar from "@/components/calendar/Calendar";
import PageHeader from "@/components/dashboard/PageHeader";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Deadlines, meetings and key dates across your workspace."
      />
      <Calendar />
    </div>
  );
}
