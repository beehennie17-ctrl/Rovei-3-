import { Card } from "@/components/ui/card";
import type { ClientSubmissionResult } from "@/types/client-submission-result";

export function VisitClientContext({ result }: { result: ClientSubmissionResult }) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow">Before you start</p>
      <h2 className="section-title mt-3">Client memory</h2>
      <dl className="mt-5 space-y-5">
        {result.consultation?.goal && (
          <div>
            <dt className="caption">What they asked for</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6">{result.consultation.goal}</dd>
          </div>
        )}
        {result.preferences && (
          <>
            <div>
              <dt className="caption">Preferred finish</dt>
              <dd className="mt-1 text-sm font-semibold">{result.preferences.finishLabel}</dd>
            </div>
            <div>
              <dt className="caption">Appointment feel</dt>
              <dd className="mt-1 text-sm font-semibold">{result.preferences.appointmentFeelLabel}</dd>
            </div>
          </>
        )}
      </dl>
      {!result.consultation?.goal && !result.preferences && <p className="body-text mt-4">No consultation or preference memory was configured for this experience.</p>}
    </Card>
  );
}
