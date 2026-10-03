import { Card } from "@/components/ui/card";
import type { ClientSubmissionResult } from "@/types/client-submission-result";

export function ClientSubmissionDetails({ result }: { result: ClientSubmissionResult }) {
  const hasConsultation = result.enabledModules.includes("consultation");
  const hasPreferences = result.enabledModules.includes("preferences");
  const hasConsent = result.enabledModules.includes("consent");
  const hasPrep = result.enabledModules.includes("prep");

  if (!hasConsultation && !hasPreferences && !hasConsent && !hasPrep) return null;

  return (
    <section className="grid gap-5 xl:grid-cols-2" aria-label="Client submission details">
      {hasConsultation && (
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <p className="eyebrow">Consultation</p>
          <p className="caption mt-4">What they&apos;d like from this appointment</p>
          <p className="mt-2 whitespace-pre-wrap text-base font-semibold leading-7">
            {result.consultation?.goal ?? "No completed consultation answer is available."}
          </p>
        </Card>
      )}

      {hasPreferences && (
        <Card className="p-5 sm:p-6">
          <p className="eyebrow">Preferences</p>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="caption">Preferred finish</dt>
              <dd className="mt-1 text-sm font-semibold">{result.preferences?.finishLabel ?? "Not available"}</dd>
            </div>
            <div>
              <dt className="caption">Appointment feel</dt>
              <dd className="mt-1 text-sm font-semibold">{result.preferences?.appointmentFeelLabel ?? "Not available"}</dd>
            </div>
          </dl>
        </Card>
      )}

      {(hasConsent || hasPrep) && (
        <Card className="p-5 sm:p-6">
          <p className="eyebrow">Acknowledgements</p>
          <dl className="mt-4 space-y-4">
            {hasConsent && (
              <div>
                <dt className="caption">Consent</dt>
                <dd className="mt-1 text-sm font-semibold">{result.consent?.acknowledged ? "Acknowledged" : "Waiting"}</dd>
                {result.consent?.acknowledged && (
                  <p className="caption mt-1.5">Client acknowledged the studio&apos;s appointment consent information.</p>
                )}
              </div>
            )}
            {hasPrep && (
              <div>
                <dt className="caption">Prep</dt>
                <dd className="mt-1 text-sm font-semibold">{result.prep?.acknowledged ? "Read" : "Waiting"}</dd>
                {result.prep?.acknowledged && <p className="caption mt-1.5">Client acknowledged the prep notes.</p>}
              </div>
            )}
          </dl>
        </Card>
      )}
    </section>
  );
}
