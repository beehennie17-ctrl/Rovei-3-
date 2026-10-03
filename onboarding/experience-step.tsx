"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExperienceMiniPreview } from "@/components/onboarding/experience-mini-preview";
import { ExperienceOptionCard } from "@/components/onboarding/experience-option-card";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import { getRecommendedExperienceModules } from "@/lib/experience-recommendations";
import { readOnboardingDraft, updateOnboardingDraft } from "@/lib/onboarding-storage";
import { resolveClientTheme } from "@/lib/theme-resolver";
import type { ThemeName } from "@/types";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

export function ExperienceStep() {
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [services, setServices] = useState<ServiceCategoryId[]>([]);
  const [themeName, setThemeName] = useState<ThemeName | undefined>();
  const [customPrimary, setCustomPrimary] = useState<string | undefined>();
  const [selections, setSelections] = useState<ExperienceModuleId[]>([]);

  useEffect(() => {
    const draft = readOnboardingDraft();
    const draftServices = draft.services ?? [];

    setStudioName(draft.studioName ?? "");
    setServices(draftServices);
    setThemeName(draft.theme);
    setCustomPrimary(draft.customPrimary);
    setSelections(
      draft.experienceSelections !== undefined
        ? draft.experienceSelections
        : getRecommendedExperienceModules(draftServices),
    );
  }, []);

  const recommended = useMemo(
    () => getRecommendedExperienceModules(services),
    [services],
  );
  const recommendedSet = useMemo(() => new Set(recommended), [recommended]);
  const resolvedTheme = useMemo(
    () => resolveClientTheme(themeName ?? "wine", customPrimary),
    [themeName, customPrimary],
  );

  function toggleExperience(id: ExperienceModuleId) {
    setSelections((current) => {
      const next = current.includes(id)
        ? current.filter((moduleId) => moduleId !== id)
        : [...current, id];

      const canonical = EXPERIENCE_OPTIONS
        .map((option) => option.id)
        .filter((moduleId) => next.includes(moduleId));

      updateOnboardingDraft({ experienceSelections: canonical });
      return canonical;
    });
  }

  function handlePreview() {
    if (selections.length === 0) return;
    updateOnboardingDraft({ experienceSelections: selections });
    router.push("/preview");
  }

  const studioContext = studioName.trim()
    ? `Creating the client experience for ${studioName.trim()}`
    : "Creating your client experience";

  return (
    <OnboardingShell
      currentStep={4}
      totalSteps={4}
      preview={(
        <ExperienceMiniPreview
          studioName={studioName}
          services={services}
          selections={selections}
          theme={resolvedTheme}
        />
      )}
    >
      <div className="page-enter">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow">Client experience</p>
          <span className="rounded-full border border-[var(--blush)] bg-[var(--wine-soft)] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--wine)]">
            Final step
          </span>
        </div>
        <h1 className="mt-5 max-w-xl text-[clamp(2.35rem,5.5vw,4.35rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)]">
          What should happen <span className="editorial-accent text-[var(--wine)]">before they arrive?</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-[1.05rem]">
          Choose what your clients complete before their appointment. We&apos;ve created a starting point based on your services.
        </p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">You can change any of this later.</p>
        <p className="mt-4 text-sm font-semibold text-[var(--wine)]">{studioContext}</p>

        <fieldset className="mt-9 sm:mt-10">
          <legend className="sr-only">Choose what clients complete before their appointment</legend>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
              Recommended for your services
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Change anything you like.</p>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
            {EXPERIENCE_OPTIONS.map((option) => (
              <ExperienceOptionCard
                key={option.id}
                option={option}
                selected={selections.includes(option.id)}
                recommended={recommendedSet.has(option.id)}
                onToggle={() => toggleExperience(option.id)}
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-9 flex items-center justify-between gap-3 sm:mt-10">
          <Button
            variant="secondary"
            icon={<ArrowLeft size={17} aria-hidden="true" />}
            onClick={() => router.push("/onboarding/mood")}
          >
            Back
          </Button>
          <Button
            disabled={selections.length === 0}
            onClick={handlePreview}
            className="min-w-44 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Preview my studio</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
