import type { ThemeName } from "@/types";

export type ServiceCategoryId =
  | "lashes"
  | "brows"
  | "nails"
  | "makeup"
  | "facials"
  | "other";

export type ExperienceModuleId =
  | "consultation"
  | "preferences"
  | "inspiration"
  | "consent"
  | "prep"
  | "current-photos";

export type OnboardingDraft = {
  studioName: string;
  services: ServiceCategoryId[];
  theme?: ThemeName;
  customPrimary?: string;
  experienceSelections?: ExperienceModuleId[];
};
