import { Card } from "@/components/ui/card";
import type { ClientSubmissionResult } from "@/types/client-submission-result";

export function ClientMemorySummary({
  result,
  visitCount,
  lastVisitLabel,
}: {
  result: ClientSubmissionResult;
  visitCount: number;
  lastVisitLabel: string;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow">Client memory</p>
      <dl className="mt-5 grid grid-cols-2 gap-5">
        <div>
          <dt className="caption">Visits</dt>
          <dd className="mt-1 text-xl font-bold">{visitCount}</dd>
        </div>
        <div>
          <dt className="caption">Last visit</dt>
          <dd className="mt-1 text-sm font-semibold">{lastVisitLabel}</dd>
        </div>
        <div>
          <dt className="caption">Preferred finish</dt>
          <dd className="mt-1 text-sm font-semibold">{result.preferences?.finishLabel ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="caption">Appointment feel</dt>
          <dd className="mt-1 text-sm font-semibold">{result.preferences?.appointmentFeelLabel ?? "Not provided"}</dd>
        </div>
      </dl>
      {result.consultation?.goal && (
        <div className="mt-6 border-t border-[var(--border-soft)] pt-5">
          <p className="caption">What they asked for</p>
          <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6">{result.consultation.goal}</p>
        </div>
      )}
    </Card>
  );
}
