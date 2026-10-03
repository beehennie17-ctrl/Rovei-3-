import { Check, Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ClientProfileViewModel } from "@/types/client-profile";

export function ClientForms({ client }: { client: ClientProfileViewModel }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--border-soft)] px-5 py-4 sm:px-6">
        <p className="eyebrow">Pre-appointment records</p>
      </div>
      <div className="divide-y divide-[var(--border-soft)]">
        {client.forms.map((form) => (
          <div key={form.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
            <span className={`grid size-8 shrink-0 place-items-center rounded-full ${form.complete ? "bg-[#F0F5F1] text-[var(--success)]" : "bg-[#FBF5EC] text-[var(--warning)]"}`}>
              {form.complete ? <Check size={15} aria-hidden /> : <Clock3 size={15} aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{form.label}</p>
              <p className="caption mt-1">{form.status}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
