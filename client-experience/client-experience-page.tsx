"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AcknowledgementStep } from "@/components/client-experience/acknowledgement-step";
import { ClientComplete } from "@/components/client-experience/client-complete";
import { ClientExperienceShell } from "@/components/client-experience/client-experience-shell";
import { ClientExperienceUnavailable } from "@/components/client-experience/client-experience-unavailable";
import { ClientProgress } from "@/components/client-experience/client-progress";
import { ClientReview } from "@/components/client-experience/client-review";
import { ClientWelcome } from "@/components/client-experience/client-welcome";
import { ConsultationStep } from "@/components/client-experience/consultation-step";
import { PhotoStep } from "@/components/client-experience/photo-step";
import { PreferencesStep } from "@/components/client-experience/preferences-step";
import { getClientPrepCopy } from "@/lib/client-prep-copy";
import {
  areAllClientExperienceModulesComplete,
  createClientExperiencePrototype,
  isClientExperienceModuleComplete,
  readClientExperiencePrototype,
  writeClientExperiencePrototype,
} from "@/lib/client-experience-prototype";
import { readPrototypePhotos } from "@/lib/client-experience-photo-store";
import { doesPrototypeClientTokenMatch, isValidPrototypeClientToken } from "@/lib/client-link-prototype";
import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import { getRecommendedExperienceModules } from "@/lib/experience-recommendations";
import { readNewClientDraft } from "@/lib/new-client-draft";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import { resolveClientTheme } from "@/lib/theme-resolver";
import type { ClientTheme } from "@/types";
import type { NewClientDraft } from "@/types/client-creation";
import type { ClientExperiencePrototype } from "@/types/client-experience";
import type { ExperienceModuleId } from "@/types/onboarding";

type ReadyState = {
  draft: NewClientDraft;
  studioName: string;
  theme: ClientTheme;
  response: ClientExperiencePrototype;
};

type PageState = { status: "loading" } | { status: "unavailable" } | ({ status: "ready" } & ReadyState);

function canonicalizeModules(selected: ExperienceModuleId[]) {
  const chosen = new Set(selected);
  return EXPERIENCE_OPTIONS.filter((option) => chosen.has(option.id)).map((option) => option.id);
}

async function reconcilePhotoIds(record: ClientExperiencePrototype): Promise<ClientExperiencePrototype> {
  if (record.status === "complete") return record;
  try {
    const [inspiration, current] = await Promise.all([
      readPrototypePhotos(record.token, "inspiration"),
      readPrototypePhotos(record.token, "current"),
    ]);
    const inspirationIds = inspiration.map((photo) => photo.id);
    const currentIds = current.map((photo) => photo.id);
    const next: ClientExperiencePrototype = {
      ...record,
      inspiration: record.inspiration
        ? { ...record.inspiration, photoIds: inspirationIds }
        : inspirationIds.length > 0
          ? { skipped: false, photoIds: inspirationIds }
          : undefined,
      currentPhotos: record.currentPhotos
        ? { ...record.currentPhotos, photoIds: currentIds }
        : currentIds.length > 0
          ? { skipped: false, photoIds: currentIds }
          : undefined,
    };
    return next;
  } catch {
    return record;
  }
}

export function ClientExperiencePage({ token }: { token: string }) {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      // Validate the opaque route before reading or displaying any client draft details.
      if (!isValidPrototypeClientToken(token) || !doesPrototypeClientTokenMatch(token)) {
        if (active) setState({ status: "unavailable" });
        return;
      }

      const draft = readNewClientDraft();
      if (!draft) {
        if (active) setState({ status: "unavailable" });
        return;
      }

      const onboarding = readOnboardingDraft();
      const configured = onboarding.experienceSelections;
      const modules = configured !== undefined
        ? canonicalizeModules(configured)
        : getRecommendedExperienceModules([draft.service]);
      const studioName = onboarding.studioName?.trim() || "Your Studio";
      const theme = resolveClientTheme(onboarding.theme, onboarding.customPrimary);

      let response = readClientExperiencePrototype(token);
      if (!response) {
        response = createClientExperiencePrototype(token, modules);
        writeClientExperiencePrototype(response);
      }
      response = await reconcilePhotoIds(response);
      if (response.status === "in-progress" && response.currentStep > 0) {
        const hydratedResponse = response;
        const firstIncomplete = hydratedResponse.modules.findIndex(
          (moduleId, index) => index < hydratedResponse.currentStep && !isClientExperienceModuleComplete(hydratedResponse, moduleId),
        );
        if (firstIncomplete >= 0) response = { ...hydratedResponse, currentStep: firstIncomplete };
      }
      writeClientExperiencePrototype(response);

      if (active) setState({ status: "ready", draft, studioName, theme, response });
    }

    void hydrate();
    return () => { active = false; };
  }, [token]);

  const currentModule = useMemo(() => {
    if (state.status !== "ready") return undefined;
    const { response } = state;
    if (response.currentStep < 0 || response.currentStep >= response.modules.length) return undefined;
    return response.modules[response.currentStep];
  }, [state]);

  if (state.status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--surface-muted)] px-5">
        <div className="h-48 w-full max-w-lg animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white" aria-hidden="true" />
        <span className="sr-only">Loading client experience</span>
      </main>
    );
  }

  if (state.status === "unavailable") return <ClientExperienceUnavailable />;

  const { draft, studioName, theme, response } = state;

  function commit(next: ClientExperiencePrototype) {
    const normalized = { ...next, updatedAt: new Date().toISOString() };
    const saved = writeClientExperiencePrototype(normalized);
    setSaveError(!saved);
    setState((current) => current.status === "ready" ? { ...current, response: normalized } : current);
    return saved;
  }

  function patch(patchValue: Partial<ClientExperiencePrototype>) {
    commit({ ...response, ...patchValue });
  }

  function goBack() {
    setAttemptedContinue(false);
    const nextStep = response.currentStep <= 0
      ? -1
      : response.currentStep === response.modules.length
        ? response.modules.length - 1
        : response.currentStep - 1;
    commit({ ...response, currentStep: nextStep });
  }

  function continueForward() {
    if (!currentModule) return;
    if (!isClientExperienceModuleComplete(response, currentModule)) {
      setAttemptedContinue(true);
      return;
    }
    setAttemptedContinue(false);
    commit({ ...response, currentStep: response.currentStep + 1 });
  }

  function submitExperience() {
    if (!areAllClientExperienceModulesComplete(response)) {
      setSaveError(true);
      return;
    }
    const timestamp = new Date().toISOString();
    const completeRecord: ClientExperiencePrototype = {
      ...response,
      status: "complete",
      currentStep: response.modules.length,
      updatedAt: timestamp,
      submittedAt: timestamp,
    };
    if (!writeClientExperiencePrototype(completeRecord)) {
      setSaveError(true);
      return;
    }
    setSaveError(false);
    setState((current) => current.status === "ready" ? { ...current, response: completeRecord } : current);
  }

  if (response.status === "complete") {
    return (
      <ClientExperienceShell studioName={studioName} theme={theme}>
        <ClientComplete draft={draft} studioName={studioName} theme={theme} />
      </ClientExperienceShell>
    );
  }

  if (response.currentStep === -1) {
    return (
      <ClientExperienceShell studioName={studioName} theme={theme}>
        <ClientWelcome
          draft={draft}
          studioName={studioName}
          theme={theme}
          onStart={() => {
            setAttemptedContinue(false);
            commit({ ...response, currentStep: 0 });
          }}
        />
        {saveError && <p className="mt-5 text-center text-xs font-semibold text-[var(--warning)]">Progress could not be saved in this browser session.</p>}
      </ClientExperienceShell>
    );
  }

  const isReview = response.currentStep === response.modules.length;

  return (
    <ClientExperienceShell studioName={studioName} theme={theme}>
      {!isReview && response.modules.length > 0 && (
        <ClientProgress current={response.currentStep + 1} total={response.modules.length} theme={theme} />
      )}

      {currentModule === "consultation" && (
        <ConsultationStep
          value={response.consultation?.goal ?? ""}
          theme={theme}
          showError={attemptedContinue}
          onChange={(goal) => patch({ consultation: { goal } })}
        />
      )}

      {currentModule === "preferences" && (
        <PreferencesStep
          finish={response.preferences?.finish}
          appointmentFeel={response.preferences?.appointmentFeel}
          theme={theme}
          showError={attemptedContinue}
          onFinishChange={(finish) => patch({ preferences: { ...response.preferences, finish } })}
          onAppointmentFeelChange={(appointmentFeel) => patch({ preferences: { ...response.preferences, appointmentFeel } })}
        />
      )}

      {currentModule === "inspiration" && (
        <PhotoStep
          token={token}
          kind="inspiration"
          title="Your inspiration"
          description="Share up to 3 images that show the direction you like."
          maxFiles={3}
          skipLabel="I don't have inspiration to add"
          photoIds={response.inspiration?.photoIds ?? []}
          skipped={response.inspiration?.skipped ?? false}
          theme={theme}
          showError={attemptedContinue}
          onChange={(inspiration) => patch({ inspiration })}
        />
      )}

      {currentModule === "current-photos" && (
        <PhotoStep
          token={token}
          kind="current"
          title="Your current look"
          description="Add up to 2 current photos if they'll help your professional prepare."
          maxFiles={2}
          skipLabel="I don't have a current photo to add"
          photoIds={response.currentPhotos?.photoIds ?? []}
          skipped={response.currentPhotos?.skipped ?? false}
          theme={theme}
          showError={attemptedContinue}
          onChange={(currentPhotos) => patch({ currentPhotos })}
        />
      )}

      {currentModule === "consent" && (
        <AcknowledgementStep
          eyebrow="Consent acknowledgement"
          title="Consent acknowledgement"
          description="Review the studio's appointment acknowledgement before continuing."
          checkboxLabel="I have read and acknowledge the studio's consent information for this appointment."
          acknowledged={response.consent?.acknowledged ?? false}
          theme={theme}
          showError={attemptedContinue}
          onChange={(acknowledged) => patch({ consent: { acknowledged } })}
        >
          <p>This is a simple appointment acknowledgement in the current frontend prototype. It is not a signature or a claim of legal sufficiency.</p>
        </AcknowledgementStep>
      )}

      {currentModule === "prep" && (
        <AcknowledgementStep
          eyebrow="Before your appointment"
          title="Before your appointment"
          description="A little preparation helps your professional start with the right context."
          checkboxLabel="I've read the prep notes."
          acknowledged={response.prep?.acknowledged ?? false}
          theme={theme}
          showError={attemptedContinue}
          onChange={(acknowledged) => patch({ prep: { acknowledged } })}
        >
          <p>{getClientPrepCopy(draft.service)}</p>
        </AcknowledgementStep>
      )}

      {isReview && <ClientReview draft={draft} record={response} theme={theme} />}

      {saveError && <p className="mt-5 text-xs font-semibold text-[var(--warning)]">Progress could not be saved in this browser session. Please try again before leaving this page.</p>}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: theme.border }}>
        <button type="button" onClick={goBack} className="focus-ring motion-soft inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold" style={{ borderColor: theme.border, color: theme.text }}>
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </button>
        {isReview ? (
          <button type="button" onClick={submitExperience} className="focus-ring motion-soft pressable inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold" style={{ backgroundColor: theme.primary, color: theme.onPrimary }}>
            Submit experience <ArrowRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" onClick={continueForward} className="focus-ring motion-soft pressable inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold" style={{ backgroundColor: theme.primary, color: theme.onPrimary }}>
            Continue <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </ClientExperienceShell>
  );
}
