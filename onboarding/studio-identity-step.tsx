"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { LockedClientPreview } from "@/components/onboarding/locked-client-preview";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import {
  readOnboardingDraft,
  updateOnboardingDraft,
} from "@/lib/onboarding-storage";

const MIN_STUDIO_NAME_LENGTH = 2;
const MAX_STUDIO_NAME_LENGTH = 60;

export function StudioIdentityStep() {
  const router = useRouter();
  const [studioName, setStudioName] = useState("");

  useEffect(() => {
    const draft = readOnboardingDraft();
    setStudioName(draft.studioName ?? "");
  }, []);

  const trimmedName = studioName.trim();
  const isValid = trimmedName.length >= MIN_STUDIO_NAME_LENGTH;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    updateOnboardingDraft({
      studioName: trimmedName,
    });

    router.push("/onboarding/services");
  }

  return (
    <OnboardingShell
      currentStep={1}
      totalSteps={4}
      preview={
        <LockedClientPreview
          studioName={studioName.trim() || "Your studio"}
          clientName="Your client"
          service="Your appointment"
        />
      }
    >
      <form onSubmit={handleSubmit}>
        <p className="rovei-eyebrow">Your studio</p>

        <h1 className="rovei-onboarding-title">
          Let&apos;s start with{" "}
          <span className="rovei-editorial">your studio.</span>
        </h1>

        <p className="rovei-onboarding-copy">
          What your clients call your studio is the first piece of the
          experience.
        </p>

        <div className="rovei-field">
          <label htmlFor="studio-name">Studio name</label>

          <input
            id="studio-name"
            className="rovei-input"
            name="studioName"
            value={studioName}
            onChange={(event) => setStudioName(event.target.value)}
            placeholder="Lash & Co."
            maxLength={MAX_STUDIO_NAME_LENGTH}
            autoComplete="organization"
          />

          <span className="rovei-help">
            You can change this anytime.
          </span>
        </div>

        <div className="rovei-step-actions rovei-step-actions-end">
          <button
            type="submit"
            className="rovei-btn"
            disabled={!isValid}
          >
            Continue
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
