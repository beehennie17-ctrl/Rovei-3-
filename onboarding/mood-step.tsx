"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomThemeControl } from "@/components/onboarding/custom-theme-control";
import { MoodMiniPreview } from "@/components/onboarding/mood-mini-preview";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ThemeChoiceCard } from "@/components/onboarding/theme-choice-card";
import { Button } from "@/components/ui/button";
import { isValidHexColour, normalizeHexColour } from "@/lib/colour-utils";
import { readOnboardingDraft, updateOnboardingDraft } from "@/lib/onboarding-storage";
import { getServiceCategory } from "@/lib/service-categories";
import { DEFAULT_CUSTOM_PRIMARY, resolveClientTheme } from "@/lib/theme-resolver";
import { THEME_OPTIONS } from "@/lib/theme-options";
import { clientThemes } from "@/lib/themes";
import type { ThemeName } from "@/types";
import type { ServiceCategoryId } from "@/types/onboarding";

function isInvalidHexEntry(value: string) {
  if (isValidHexColour(value)) return false;
  const validPartial = /^#[0-9A-Fa-f]{0,6}$/.test(value);
  return !validPartial || value.length >= 7;
}

export function MoodStep() {
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [services, setServices] = useState<ServiceCategoryId[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName | null>(null);
  const [customHexInput, setCustomHexInput] = useState(DEFAULT_CUSTOM_PRIMARY);
  const [validCustomPrimary, setValidCustomPrimary] = useState(DEFAULT_CUSTOM_PRIMARY);

  useEffect(() => {
    const draft = readOnboardingDraft();
    setStudioName(draft.studioName ?? "");
    setServices(draft.services ?? []);

    if (draft.customPrimary && isValidHexColour(draft.customPrimary)) {
      const normalized = normalizeHexColour(draft.customPrimary);
      setCustomHexInput(normalized);
      setValidCustomPrimary(normalized);
    }

    if (draft.theme) {
      setSelectedTheme(draft.theme);
      if (draft.theme === "custom" && !draft.customPrimary) {
        updateOnboardingDraft({ customPrimary: DEFAULT_CUSTOM_PRIMARY });
      }
    }
  }, []);

  const resolvedTheme = useMemo(
    () => resolveClientTheme(selectedTheme ?? "wine", validCustomPrimary),
    [selectedTheme, validCustomPrimary],
  );

  function selectTheme(themeName: ThemeName) {
    setSelectedTheme(themeName);

    if (themeName === "custom") {
      updateOnboardingDraft({ theme: "custom", customPrimary: validCustomPrimary });
      return;
    }

    updateOnboardingDraft({ theme: themeName });
  }

  function handleCustomTextChange(value: string) {
    setCustomHexInput(value);
    if (!isValidHexColour(value)) return;

    const normalized = normalizeHexColour(value);
    setCustomHexInput(normalized);
    setValidCustomPrimary(normalized);
    updateOnboardingDraft({ theme: "custom", customPrimary: normalized });
  }

  function handleCustomColourChange(value: string) {
    if (!isValidHexColour(value)) return;
    const normalized = normalizeHexColour(value);
    setCustomHexInput(normalized);
    setValidCustomPrimary(normalized);
    updateOnboardingDraft({ theme: "custom", customPrimary: normalized });
  }

  function handleContinue() {
    if (!selectedTheme) return;
    if (selectedTheme === "custom" && !isValidHexColour(customHexInput)) return;

    updateOnboardingDraft({
      theme: selectedTheme,
      ...(selectedTheme === "custom" ? { customPrimary: validCustomPrimary } : {}),
    });
    router.push("/onboarding/experience");
  }

  const studioContext = studioName.trim()
    ? `Designing Rovei. for ${studioName.trim()}`
    : "Designing your Rovei. studio";
  const selectedServiceNames = services
    .map((id) => getServiceCategory(id)?.name)
    .filter((name): name is string => Boolean(name));
  const customError = selectedTheme === "custom" && isInvalidHexEntry(customHexInput);
  const canContinue = Boolean(selectedTheme) && (selectedTheme !== "custom" || isValidHexColour(customHexInput));

  return (
    <OnboardingShell
      currentStep={3}
      totalSteps={4}
      preview={(
        <MoodMiniPreview
          studioName={studioName}
          services={services}
          theme={resolvedTheme}
          hasSelection={Boolean(selectedTheme)}
        />
      )}
    >
      <div className="page-enter">
        <p className="eyebrow">Your look</p>
        <h1 className="mt-5 max-w-xl text-[clamp(2.35rem,5.5vw,4.35rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)]">
          How should your <span className="editorial-accent text-[var(--wine)]">studio feel?</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-[1.05rem]">
          Choose a mood for your client experience. You can refine it anytime.
        </p>
        <p className="mt-4 text-sm font-semibold text-[var(--wine)]">{studioContext}</p>
        {selectedServiceNames.length > 0 && (
          <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
            {selectedServiceNames.join(" · ")}
          </p>
        )}

        <fieldset className="mt-8 sm:mt-9">
          <legend className="sr-only">Choose the mood for your client experience</legend>
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
            {THEME_OPTIONS.map((option) => {
              const cardTheme = option.id === "custom"
                ? resolveClientTheme("custom", validCustomPrimary)
                : clientThemes[option.id];

              return (
                <ThemeChoiceCard
                  key={option.id}
                  themeName={option.id}
                  theme={cardTheme}
                  description={option.description}
                  selected={selectedTheme === option.id}
                  onSelect={() => selectTheme(option.id)}
                />
              );
            })}
          </div>
        </fieldset>

        {selectedTheme === "custom" && (
          <CustomThemeControl
            textValue={customHexInput}
            activeColour={validCustomPrimary}
            showError={customError}
            onTextChange={handleCustomTextChange}
            onColourChange={handleCustomColourChange}
          />
        )}

        <div className="mt-9 flex items-center justify-between gap-3 sm:mt-10">
          <Button
            variant="secondary"
            icon={<ArrowLeft size={17} aria-hidden="true" />}
            onClick={() => router.push("/onboarding/services")}
          >
            Back
          </Button>
          <Button
            disabled={!canContinue}
            icon={<ArrowRight size={17} aria-hidden="true" />}
            onClick={handleContinue}
            className="min-w-36 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
