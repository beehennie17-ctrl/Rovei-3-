import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const STEPS = [
  "Send the link",
  "Your client completes their experience",
  "Their Client Card is ready before the appointment",
];

export function ClientLinkNextSteps() {
  return (
    <Card className="p-6 sm:p-7">
      <p className="eyebrow">The Rovei loop</p>
      <h2 className="section-title mt-2">What happens next</h2>
      <ol className="mt-6 space-y-5">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--wine-soft)] text-xs font-bold text-[var(--wine)]">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 border-b border-[var(--border-soft)] pb-5 last:border-0 last:pb-0">
              <span className="text-sm font-semibold text-[var(--text-primary)]">{step}</span>
              {index < STEPS.length - 1 && <ArrowRight size={15} className="shrink-0 text-[var(--text-secondary)]" aria-hidden="true" />}
            </div>
          </li>
        ))}
      </ol>
      <p className="caption mt-6">The client completion flow is the next frontend build.</p>
    </Card>
  );
}
