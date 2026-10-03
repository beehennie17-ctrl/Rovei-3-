import { AlertTriangle, Check, Clock3, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ClientSubmissionReadinessRow } from "@/types/client-submission-result";

function RowIcon({ state }: { state: ClientSubmissionReadinessRow["state"] }) {
  if (state === "complete") return <Check size={14} aria-hidden="true" />;
  if (state === "waiting") return <Clock3 size={14} aria-hidden="true" />;
  if (state === "unavailable") return <AlertTriangle size={14} aria-hidden="true" />;
  return <MessageSquareText size={14} aria-hidden="true" />;
}

function iconClass(state: ClientSubmissionReadinessRow["state"]) {
  if (state === "complete") return "bg-[#F0F5F1] text-[var(--success)]";
  if (state === "waiting") return "bg-[#FBF5EC] text-[var(--warning)]";
  if (state === "unavailable") return "bg-[var(--wine-soft)] text-[var(--wine)]";
  return "bg-[var(--surface-muted)] text-[var(--text-secondary)]";
}

export function ClientReadinessResult({ rows }: { rows: ClientSubmissionReadinessRow[] }) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow">Client readiness</p>
      <div className="mt-4 space-y-2.5">
        {rows.filter((row) => row.id !== "client-notes").map((row) => (
          <div key={row.id} className="flex items-center gap-3 rounded-2xl bg-[var(--surface-muted)] px-4 py-3.5">
            <span className={`grid size-7 shrink-0 place-items-center rounded-full ${iconClass(row.state)}`}>
              <RowIcon state={row.state} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{row.label}</p>
              <p className="caption mt-0.5">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
