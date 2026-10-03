"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { StudioMiniPreview } from "@/components/onboarding/studio-mini-preview";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { readOnboardingDraft, updateOnboardingDraft } from "@/lib/onboarding-storage";

const MIN_STUDIO_NAME_LENGTH = 2;
const MAX_STUDIO_NAME_LENGTH = 60;

export function StudioIdentityStep() {
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [showDelight, setShowDelight] = useState(false);
  const initiallyEmpty = useRef(true);
  const delightShown = useRef(false);

  useEffect(() => {
    const draft = readOnboardingDraft();
    const savedName = draft.studioName ?? "";
    initiallyEmpty.current = savedName.length === 0;
    setStudioName(savedName);

    if (window.matchMedia("(min-width: 768px)").matches) {
      window.requestAnimationFrame(() => document.getElementById("studio-name")?.focus());
    }
  }, []);

  const trimmedName = studioName.trim();
  const isValid = trimmedName.length >= MIN_STUDIO_NAME_LENGTH;

  function handleChange(value: string) {
    setStudioName(value);

    if (initiallyEmpty.current && !delightShown.current && value.trim().length >= MIN_STUDIO_NAME_LENGTH) {
      delightShown.current = true;
      setShowDelight(true);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    updateOnboardingDraft({ studioName: trimmedName });
    setStudioName(trimmedName);
    router.push("/onboarding/services");
  }

  return (
    <OnboardingShell
      currentStep={1}
      totalSteps={4}
      preview={<StudioMiniPreview studioName={studioName} delight={showDelight} />}
    >
      <form onSubmit={handleSubmit} className="page-enter">
        <p className="eyebrow">Your studio</p>
        <h1 className="mt-5 max-w-xl text-[clamp(2.4rem,6vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)]">
          Let&apos;s make Rovei <span className="editorial-accent text-[var(--wine)]">feel like yours.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-[1.05rem]">
          We&apos;ll start with the easiest part — what your clients call your studio.
        </p>

        <div className="mt-10 sm:mt-12">
          <h2 className="text-xl font-bold tracking-[-0.025em] text-[var(--text-primary)] sm:text-2xl">
            What should we call your studio?
          </h2>
          <div className="mt-6 max-w-lg">
            <Field label="Studio name" htmlFor="studio-name" hint="You can change this anytime.">
              <Input
                id="studio-name"
                name="studioName"
                value={studioName}
                onChange={(event) => handleChange(event.target.value)}
                placeholder="Lash & Co."
                maxLength={MAX_STUDIO_NAME_LENGTH}
                autoComplete="organization"
                className="h-14 rounded-[var(--radius-md)] px-5 text-base"
              />
            </Field>
          </div>
        </div>

        <div className="mt-8 flex items-center sm:mt-10">
          <Button type="submit" disabled={!isValid} icon={<ArrowRight size={17} aria-hidden="true" />} className="min-w-36 disabled:cursor-not-allowed disabled:opacity-50">
            Continue
          </Button>
        </div>
      </form>
    </OnboardingShell>
  );
}
