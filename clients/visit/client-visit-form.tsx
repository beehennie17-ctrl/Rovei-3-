"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/form-controls";
import { appendCompletedVisit } from "@/lib/client-visit-prototype";
import { clearPrototypeVisitPhotosForVisit, savePrototypeVisitPhotos } from "@/lib/client-visit-photo-store";
import { generatePrototypeVisitId, isValidVisitSummary, VISIT_SUMMARY_MAX_LENGTH } from "@/lib/client-visit";
import type { NewClientDraft } from "@/types/client-creation";
import { VisitPhotoPicker } from "@/components/clients/visit/visit-photo-picker";

export function ClientVisitForm({
  token,
  draft,
}: {
  token: string;
  draft: NewClientDraft;
}) {
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
  const [afterFiles, setAfterFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const validSummary = isValidVisitSummary(summary);
  const showSummaryError = touched && !validSummary;

  async function completeVisit() {
    setTouched(true);
    setFeedback("");
    if (!validSummary || submitting) return;

    setSubmitting(true);
    let visitId: string | null = null;
    try {
      visitId = generatePrototypeVisitId();
      const before = await savePrototypeVisitPhotos(token, visitId, "before", beforeFiles);
      const after = await savePrototypeVisitPhotos(token, visitId, "after", afterFiles);
      const completedAt = new Date().toISOString();
      const saved = appendCompletedVisit(token, {
        id: visitId,
        service: draft.service,
        appointmentDate: draft.appointmentDate,
        appointmentTime: draft.appointmentTime,
        summary: summary.trim(),
        beforePhotoIds: before.map((photo) => photo.id),
        afterPhotoIds: after.map((photo) => photo.id),
        completedAt,
      });
      if (!saved) throw new Error("Unable to store visit metadata.");
      router.push("/app/clients/new/history");
    } catch {
      if (visitId) {
        try { await clearPrototypeVisitPhotosForVisit(token, visitId); } catch { /* best effort rollback */ }
      }
      setFeedback("Couldn't complete this prototype visit in the browser. Your visit has not been marked complete; please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void completeVisit(); }} noValidate>
      <Card className="p-5 sm:p-6">
        <label htmlFor="visit-summary" className="text-sm font-semibold">Visit summary</label>
        <p id="visit-summary-help" className="caption mt-1.5">Note what you did, what worked, and anything worth remembering next time.</p>
        <Textarea
          id="visit-summary"
          value={summary}
          maxLength={VISIT_SUMMARY_MAX_LENGTH}
          placeholder="Soft, wispy finish. Kept the outer corners slightly longer..."
          className="mt-4 min-h-40"
          aria-invalid={showSummaryError || undefined}
          aria-describedby="visit-summary-help visit-summary-error visit-summary-count"
          onBlur={() => setTouched(true)}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setSummary(event.currentTarget.value)}
        />
        <div className="mt-2 flex items-start justify-between gap-4">
          <p id="visit-summary-error" className="text-xs font-semibold text-[var(--warning)]" hidden={!showSummaryError}>Enter at least 2 characters for the visit summary.</p>
          <p id="visit-summary-count" className="caption ml-auto">{summary.length}/{VISIT_SUMMARY_MAX_LENGTH}</p>
        </div>
      </Card>

      <Card className="space-y-7 p-5 sm:p-6">
        <VisitPhotoPicker kind="before" title="Before photos" description="Optional visual context from before the appointment." files={beforeFiles} onChange={setBeforeFiles} />
        <div className="border-t border-[var(--border-soft)]" />
        <VisitPhotoPicker kind="after" title="After photos" description="Optional visual memory of the finished appointment." files={afterFiles} onChange={setAfterFiles} />
      </Card>

      {feedback && <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4 text-sm font-semibold text-[var(--warning)]" role="status">{feedback}</div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="caption">Prototype visit · same browser only. Photos are stored locally until backend storage is connected.</p>
        <Button type="submit" disabled={!validSummary || submitting} icon={<ArrowRight size={16} aria-hidden="true" />} className="w-full sm:w-auto">
          {submitting ? "Completing visit..." : "Complete visit"}
        </Button>
      </div>
    </form>
  );
}
