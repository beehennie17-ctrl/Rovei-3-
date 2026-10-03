import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/headers";
import type { DashboardAppointment } from "@/types/dashboard";
import { TodayClientRow } from "./today-client-row";

export function TodayClients({ appointments }: { appointments: DashboardAppointment[] }) {
  return (
    <section className="space-y-4" aria-labelledby="today-clients-heading">
      <SectionHeader
        title={<span id="today-clients-heading">Today’s clients</span>}
        description="Appointment readiness, in order."
      />
      <Card className="divide-y divide-[var(--border-soft)] overflow-hidden">
        {appointments.map((appointment) => <TodayClientRow key={appointment.id} appointment={appointment} />)}
      </Card>
    </section>
  );
}
