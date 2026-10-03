import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ClientProfileViewModel } from "@/types/client-profile";

export function ClientVisits({ client }: { client: ClientProfileViewModel }) {
  if (client.visits.length === 0) {
    return (
      <Card className="p-7 sm:p-9">
        <span className="grid size-10 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]"><CalendarDays size={18} aria-hidden /></span>
        <h3 className="section-title mt-5">No previous visits yet.</h3>
        <p className="body-text mt-2 max-w-xl">After {client.name.split(" ")[0]}’s first appointment, their history will appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {client.visits.map((visit) => (
        <Card key={visit.id} className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">{visit.date}</p>
              <h3 className="mt-2 text-base font-bold">{visit.service}</h3>
            </div>
            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">Visit record</span>
          </div>
          <p className="body-text mt-4 max-w-3xl">{visit.summary}</p>
        </Card>
      ))}
    </div>
  );
}
