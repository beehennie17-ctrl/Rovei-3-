import { Check, Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import type { ClientProfileViewModel } from "@/types/client-profile";

export function ClientOverview({ client }: { client: ClientProfileViewModel }) {
  const latestNote = client.notes[0];
  const next = client.nextAppointment
    ? [client.nextAppointment, client.nextAppointmentTime].filter(Boolean).join(" · ")
    : null;

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <p className="eyebrow">Next appointment</p>
        {next ? (
          <div className="mt-4 space-y-2">
            <p className="text-lg font-bold">{next}</p>
            <p className="text-sm text-[var(--text-secondary)]">{client.primaryService}</p>
            <div className="pt-2"><StatusBadge status={client.status} /></div>
          </div>
        ) : (
          <p className="body-text mt-4">Nothing scheduled.</p>
        )}
      </Card>

      <Card className="p-5 sm:p-6">
        <p className="eyebrow">What to know</p>
        <dl className="mt-4 space-y-4">
          {client.preferences.slice(0, 3).map((preference) => (
            <div key={preference.id}>
              <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]">{preference.label}</dt>
              <dd className="mt-1 text-sm font-semibold">{preference.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-5 sm:p-6 xl:col-span-2">
        <p className="eyebrow">Readiness</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {client.readinessItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-2xl bg-[var(--surface-muted)] p-4">
              <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${item.complete ? "bg-[#F0F5F1] text-[var(--success)]" : "bg-[#FBF5EC] text-[var(--warning)]"}`}>
                {item.complete ? <Check size={14} aria-hidden /> : <Clock3 size={14} aria-hidden />}
              </span>
              <div>
                <p className="text-xs font-bold">{item.label}</p>
                <p className="caption mt-1">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {latestNote && (
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <p className="eyebrow">Studio note</p>
          <blockquote className="editorial-accent mt-4 max-w-3xl text-xl leading-relaxed">“{latestNote.text}”</blockquote>
        </Card>
      )}
    </div>
  );
}
