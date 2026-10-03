import { MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ClientProfileViewModel } from "@/types/client-profile";

export function ClientNotes({ client }: { client: ClientProfileViewModel }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Studio notes</p>
        <p className="caption mt-1.5">Private professional context for this client.</p>
      </div>
      {client.notes.map((note) => (
        <Card key={note.id} className="p-5 sm:p-6">
          <div className="flex gap-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]"><MessageSquareText size={16} aria-hidden /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]">{note.dateLabel}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{note.text}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
