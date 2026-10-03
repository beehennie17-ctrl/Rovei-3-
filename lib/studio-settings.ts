import { isValidHexColour, normalizeHexColour } from "@/lib/colour-utils";
import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import { getRecommendedExperienceModules } from "@/lib/experience-recommendations";
import { readOnboardingDraft, updateOnboardingDraft } from "@/lib/onboarding-storage";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import { DEFAULT_CUSTOM_PRIMARY, isThemeName } from "@/lib/theme-resolver";
import type { ThemeName } from "@/types";
import type { ExperienceModuleId, OnboardingDraft, ServiceCategoryId } from "@/types/onboarding";

export const STUDIO_NAME_MIN_LENGTH = 2;
export const STUDIO_NAME_MAX_LENGTH = 60;

export type StudioSettingsState = {
  studioName: string;
  services: ServiceCategoryId[];
  theme: ThemeName;
  customPrimary: string;
  experienceSelections: ExperienceModuleId[];
};

export function isValidStudioName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= STUDIO_NAME_MIN_LENGTH && trimmed.length <= STUDIO_NAME_MAX_LENGTH;
}

export function canonicalizeStudioServices(services: ServiceCategoryId[]): ServiceCategoryId[] {
  const selected = new Set(services);
  return SERVICE_CATEGORIES.map((category) => category.id).filter((id) => selected.has(id));
}

export function canonicalizeStudioExperience(modules: ExperienceModuleId[]): ExperienceModuleId[] {
  const selected = new Set(modules);
  return EXPERIENCE_OPTIONS.map((option) => option.id).filter((id) => selected.has(id));
}

export function buildStudioSettingsState(draft: Partial<OnboardingDraft>): StudioSettingsState {
  const services = canonicalizeStudioServices(draft.services ?? []);
  const customPrimary = draft.customPrimary && isValidHexColour(draft.customPrimary)
    ? normalizeHexColour(draft.customPrimary)
    : DEFAULT_CUSTOM_PRIMARY;

  return {
    studioName: draft.studioName ?? "",
    services,
    theme: isThemeName(draft.theme) ? draft.theme : "wine",
    customPrimary,
    experienceSelections: draft.experienceSelections !== undefined
      ? canonicalizeStudioExperience(draft.experienceSelections)
      : getRecommendedExperienceModules(services),
  };
}

export function studioSettingsEqual(first: StudioSettingsState, second: StudioSettingsState): boolean {
  return first.studioName === second.studioName
    && first.theme === second.theme
    && first.customPrimary === second.customPrimary
    && first.services.length === second.services.length
    && first.services.every((id, index) => id === second.services[index])
    && first.experienceSelections.length === second.experienceSelections.length
    && first.experienceSelections.every((id, index) => id === second.experienceSelections[index]);
}

export function isValidStudioSettings(state: StudioSettingsState, customHexInput = state.customPrimary): boolean {
  return isValidStudioName(state.studioName)
    && state.services.length > 0
    && isThemeName(state.theme)
    && (state.theme !== "custom" || isValidHexColour(customHexInput))
    && state.experienceSelections.length > 0;
}

export function saveStudioSettings(state: StudioSettingsState): boolean {
  const payload: Partial<OnboardingDraft> = {
    studioName: state.studioName.trim(),
    services: canonicalizeStudioServices(state.services),
    theme: state.theme,
    customPrimary: normalizeHexColour(state.customPrimary),
    experienceSelections: canonicalizeStudioExperience(state.experienceSelections),
  };

  updateOnboardingDraft(payload);
  const persisted = readOnboardingDraft();

  return persisted.studioName === payload.studioName
    && persisted.theme === payload.theme
    && persisted.customPrimary === payload.customPrimary
    && Array.isArray(persisted.services)
    && persisted.services.length === payload.services?.length
    && persisted.services.every((id, index) => id === payload.services?.[index])
    && Array.isArray(persisted.experienceSelections)
    && persisted.experienceSelections.length === payload.experienceSelections?.length
    && persisted.experienceSelections.every((id, index) => id === payload.experienceSelections?.[index]);
}
