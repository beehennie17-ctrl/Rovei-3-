"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { StudioClientPreview } from "@/components/studio/studio-client-preview";
import { StudioExperienceSection } from "@/components/studio/studio-experience-section";
import { StudioIdentitySection } from "@/components/studio/studio-identity-section";
import { StudioSaveActions } from "@/components/studio/studio-save-actions";
import { StudioServicesSection } from "@/components/studio/studio-services-section";
import { StudioThemeSection } from "@/components/studio/studio-theme-section";
import { Skeleton } from "@/components/ui/feedback";
import { isValidHexColour, normalizeHexColour } from "@/lib/colour-utils";
import { getRecommendedExperienceModules } from "@/lib/experience-recommendations";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import { DEFAULT_CUSTOM_PRIMARY, resolveClientTheme } from "@/lib/theme-resolver";
import {
  buildStudioSettingsState,
  canonicalizeStudioExperience,
  canonicalizeStudioServices,
  isValidStudioName,
  isValidStudioSettings,
  saveStudioSettings,
  studioSettingsEqual,
  type StudioSettingsState,
} from "@/lib/studio-settings";
import type { ThemeName } from "@/types";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

function normalizeForComparison(state: StudioSettingsState): StudioSettingsState {
  return {
    ...state,
    studioName: state.studioName.trim(),
    services: canonicalizeStudioServices(state.services),
    customPrimary: normalizeHexColour(state.customPrimary),
    experienceSelections: canonicalizeStudioExperience(state.experienceSelections),
  };
}

export function StudioPage() {
  const [hydrated, setHydrated] = useState(false);
  const [persisted, setPersisted] = useState<StudioSettingsState | null>(null);
  const [studioName, setStudioName] = useState("");
  const [services, setServices] = useState<ServiceCategoryId[]>([]);
  const [theme, setTheme] = useState<ThemeName>("wine");
  const [customHexInput, setCustomHexInput] = useState(DEFAULT_CUSTOM_PRIMARY);
  const [validCustomPrimary, setValidCustomPrimary] = useState(DEFAULT_CUSTOM_PRIMARY);
  const [experienceSelections, setExperienceSelections] = useState<ExperienceModuleId[]>([]);
  const [nameTouched, setNameTouched] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const initial = buildStudioSettingsState(readOnboardingDraft());
    setPersisted(initial);
    setStudioName(initial.studioName);
    setServices(initial.services);
    setTheme(initial.theme);
    setCustomHexInput(initial.customPrimary);
    setValidCustomPrimary(initial.customPrimary);
    setExperienceSelections(initial.experienceSelections);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(false), 2500);
    return () => window.clearTimeout(id);
  }, [saved]);

  const recommendations = useMemo(() => getRecommendedExperienceModules(services), [services]);
  const resolvedTheme = useMemo(
    () => resolveClientTheme(theme, validCustomPrimary),
    [theme, validCustomPrimary],
  );

  const current = useMemo<StudioSettingsState>(() => ({
    studioName,
    services: canonicalizeStudioServices(services),
    theme,
    customPrimary: validCustomPrimary,
    experienceSelections: canonicalizeStudioExperience(experienceSelections),
  }), [studioName, services, theme, validCustomPrimary, experienceSelections]);

  const comparableCurrent = useMemo(() => normalizeForComparison(current), [current]);
  const comparablePersisted = useMemo(() => persisted ? normalizeForComparison(persisted) : null, [persisted]);
  const customInputDirty = theme === "custom" && customHexInput !== validCustomPrimary;
  const dirty = Boolean(comparablePersisted && (!studioSettingsEqual(comparableCurrent, comparablePersisted) || customInputDirty));
  const customError = theme === "custom" && !isValidHexColour(customHexInput);
  const valid = isValidStudioSettings(current, customHexInput);

  function markChanged() {
    setSaved(false);
    setSaveError("");
  }

  function toggleService(id: ServiceCategoryId) {
    markChanged();
    setServices((existing) => canonicalizeStudioServices(
      existing.includes(id) ? existing.filter((value) => value !== id) : [...existing, id],
    ));
  }

  function selectTheme(nextTheme: ThemeName) {
    markChanged();
    if (nextTheme !== "custom" && !isValidHexColour(customHexInput)) {
      setCustomHexInput(validCustomPrimary);
    }
    if (nextTheme === "custom") {
      setCustomHexInput(validCustomPrimary);
    }
    setTheme(nextTheme);
  }

  function handleCustomTextChange(value: string) {
    markChanged();
    setCustomHexInput(value);
    if (!isValidHexColour(value)) return;
    const normalized = normalizeHexColour(value);
    setCustomHexInput(normalized);
    setValidCustomPrimary(normalized);
  }

  function handleCustomColourChange(value: string) {
    if (!isValidHexColour(value)) return;
    markChanged();
    const normalized = normalizeHexColour(value);
    setCustomHexInput(normalized);
    setValidCustomPrimary(normalized);
  }

  function toggleExperience(id: ExperienceModuleId) {
    markChanged();
    setExperienceSelections((existing) => canonicalizeStudioExperience(
      existing.includes(id) ? existing.filter((value) => value !== id) : [...existing, id],
    ));
  }

  function applyRecommendations() {
    markChanged();
    setExperienceSelections(canonicalizeStudioExperience(recommendations));
  }

  function restore(state: StudioSettingsState) {
    setStudioName(state.studioName);
    setServices(state.services);
    setTheme(state.theme);
    setCustomHexInput(state.customPrimary);
    setValidCustomPrimary(state.customPrimary);
    setExperienceSelections(state.experienceSelections);
    setNameTouched(false);
    setSaved(false);
    setSaveError("");
  }

  function handleDiscard() {
    if (persisted) restore(persisted);
  }

  function handleSave(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setNameTouched(true);
    setSaved(false);
    setSaveError("");
    if (!valid) return;

    const next = normalizeForComparison(current);
    const success = saveStudioSettings(next);
    if (!success) {
      setSaveError("Couldn't save these Studio changes in this browser. Please try again.");
      return;
    }

    setPersisted(next);
    restore(next);
    setSaved(true);
  }

  if (!hydrated || !persisted) {
    return (
      <div className="mx-auto max-w-7xl space-y-6" aria-label="Loading Studio settings">
        <Skeleton className="h-28" />
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.95fr)]">
          <Skeleton className="h-[48rem]" />
          <Skeleton className="h-[38rem]" />
        </div>
      </div>
    );
  }

  const nameError = nameTouched && !isValidStudioName(studioName)
    ? "Enter a Studio name between 2 and 60 characters."
    : undefined;
  const servicesError = services.length === 0 ? "Choose at least one service." : undefined;
  const modulesError = experienceSelections.length === 0 ? "Choose at least one client step." : undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-8 page-enter">
      <header className="max-w-3xl">
        <p className="eyebrow">Your studio</p>
        <h1 className="page-title mt-3">Studio</h1>
        <p className="body-text mt-3">Manage the identity and client experience your clients see across Rovei.</p>
        <p className="caption mt-2">Changes here shape future client-facing experiences and previews. Historical prototype records are not rewritten.</p>
      </header>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.38fr)_minmax(340px,0.98fr)] lg:items-start">
        <form className="space-y-5" onSubmit={handleSave} noValidate>
          <StudioIdentitySection
            studioName={studioName}
            error={nameError}
            onChange={(value) => { markChanged(); setStudioName(value); }}
            onBlur={() => setNameTouched(true)}
          />
          <StudioServicesSection services={services} error={servicesError} onToggle={toggleService} />
          <StudioThemeSection
            selectedTheme={theme}
            customHexInput={customHexInput}
            validCustomPrimary={validCustomPrimary}
            customError={customError}
            onSelectTheme={selectTheme}
            onCustomTextChange={handleCustomTextChange}
            onCustomColourChange={handleCustomColourChange}
          />
          <StudioExperienceSection
            selections={experienceSelections}
            recommendations={recommendations}
            error={modulesError}
            onToggle={toggleExperience}
            onApplyRecommendations={applyRecommendations}
          />
          <StudioSaveActions
            dirty={dirty}
            valid={valid}
            saved={saved}
            error={saveError}
            onDiscard={handleDiscard}
          />
        </form>

        <aside className="min-w-0 lg:sticky lg:top-7" aria-label="Studio client-facing preview">
          <StudioClientPreview
            studioName={studioName}
            services={services}
            modules={experienceSelections}
            theme={resolvedTheme}
          />
        </aside>
      </div>
    </div>
  );
}
