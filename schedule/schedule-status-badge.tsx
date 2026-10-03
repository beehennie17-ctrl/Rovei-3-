import { Badge, StatusBadge } from "@/components/ui/badge";
import type { ScheduleAppointmentStatus } from "@/types/schedule";

export function ScheduleStatusBadge({ status }: { status: ScheduleAppointmentStatus }) {
  if (status === "cancelled") {
    return <Badge className="border-[var(--mauve)] bg-[#F5F1F4] uppercase text-[var(--text-secondary)]">cancelled</Badge>;
  }
  return <StatusBadge status={status} />;
}
