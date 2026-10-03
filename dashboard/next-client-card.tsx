import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/headers";
import { StatusBadge } from "@/components/ui/badge";
import type { DashboardAppointment } from "@/types/dashboard";

export function NextClientCard({ appointment }: { appointment: DashboardAppointment }) {
  return (
    <section className="space-y-4" aria-labelledby="next-up-heading">
      <SectionHeader
        title={<span id="next-up-heading">Next up</span>}
        description="The next person walking through your door."
      />
      <Card className="shimmer-micro texture-cosmetic relative overflow-hidden border-[var(--blush)] bg-white p-5 sm:p-7 lg:p-8">
        <div className="absolute -right-16 -top-20 size-56 rounded-full bg-[var(--rose-milk)]/35 blur-3xl" aria-hidden />
        <div className="relative z-[1] grid gap-7 xl:grid-cols-[minmax(0,0.78fr)_minmax(360px,1.22fr)] xl:items-start">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar initials={appointment.initials} size="lg" />
                <div className="min-w-0">
                  <p className="eyebrow mb-2">Today · {appointment.time}</p>
                  <h3 className="truncate text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{appointment.name}</h3>
                  <p className="body-text mt-1.5">{appointment.service} · {appointment.clientType}</p>
                </div>
              </div>
              <StatusBadge status={appointment.status} />
            </div>

            <p className="mt-6 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{appointment.context}</p>

            <Link
              href={`/app/clients/${appointment.clientId}`}
              aria-label={`Open Client Card for ${appointment.name}`}
              className="focus-ring motion-soft mt-7 inline-flex items-center gap-2 text-sm font-bold text-[var(--wine)] hover:gap-2.5"
            >
              Open Client Card <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          <div className="rounded-[22px] border border-[var(--border-soft)] bg-white/85 p-4 shadow-[0_10px_28px_rgba(58,33,42,0.04)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold">Readiness</p>
                <p className="caption mt-1">What’s already handled before {appointment.time}.</p>
              </div>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F0F5F1] text-[var(--success)]" aria-hidden>
                <Check size={17} />
              </span>
            </div>
            <dl className="divide-y divide-[var(--border-soft)]">
              {appointment.readinessItems?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <dt className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</dt>
                  <dd className="shrink-0 text-xs font-bold text-[var(--success)]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Card>
    </section>
  );
}
