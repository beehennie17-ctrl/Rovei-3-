import { isValidHexColour, normalizeHexColour } from "@/lib/colour-utils";
import { isExperienceModuleId } from "@/lib/experience-options";
import { isServiceCategoryId } from "@/lib/service-categories";
import { isThemeName } from "@/lib/theme-resolver";
import type { OnboardingDraft } from "@/types/onboarding";

export const ONBOARDING_DRAFT_STORAGE_KEY = "rovei:onboarding-draft";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readOnboardingDraft(): Partial<OnboardingDraft> {
  if (!canUseStorage()) return {};

  try {
    const stored = window.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const value = parsed as Record<string, unknown>;
    const draft: Partial<OnboardingDraft> = {};

    if (typeof value.studioName === "string") {
      draft.studioName = value.studioName;
    }

    if (Array.isArray(value.services)) {
      draft.services = value.services.filter(isServiceCategoryId);
    }

    if (isThemeName(value.theme)) {
      draft.theme = value.theme;
    }

    if (typeof value.customPrimary === "string" && isValidHexColour(value.customPrimary)) {
      draft.customPrimary = normalizeHexColour(value.customPrimary);
    }

    if (Array.isArray(value.experienceSelections)) {
      draft.experienceSelections = value.experienceSelections.filter(isExperienceModuleId);
    }

    return draft;
  } catch {
    return {};
  }
}

export function updateOnboardingDraft(update: Partial<OnboardingDraft>): Partial<OnboardingDraft> {
  if (!canUseStorage()) return update;

  const next = { ...readOnboardingDraft(), ...update };

  try {
    window.localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Frontend draft persistence is best-effort; storage restrictions must not block onboarding.
  }

  return next;
}
