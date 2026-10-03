import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/headers";
import { StatusBadge } from "@/components/ui/badge";
import type { DashboardAppointment } from "@/types/dashboard";
import { AttentionEmptyState } from "./dashboard-empty-state";

export function NeedsAttention({ appointments }: { appointments: DashboardAppointment[] }) {
  return (
    <section className="space-y-4" aria-labelledby="needs-attention-heading">
      <SectionHeader
        title={<span id="needs-attention-heading">Needs attention</span>}
        description="Only what is still outstanding."
      />
      {appointments.length === 0 ? (
        <AttentionEmptyState />
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold">{appointment.name}</h3>
                  <p className="caption mt-1">{appointment.time} · {appointment.service}</p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>

              <div className="mt-5 rounded-[18px] bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]">Waiting on</p>
                <ul className="mt-3 space-y-2">
                  {appointment.outstandingItems?.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm font-semibold">
                      <span className="size-1.5 rounded-full bg-[var(--wine)]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="caption">Client experience incomplete.</p>
                <Link
                  href={`/app/clients/${appointment.clientId}`}
                  aria-label={`View ${appointment.name}`}
                  className="focus-ring motion-soft inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-[var(--wine)] hover:gap-2"
                >
                  View client <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
