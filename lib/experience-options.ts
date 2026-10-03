import type { ServiceCategoryId, ExperienceModuleId } from "@/types/onboarding";

export type ExperienceOptionIcon =
  | "consultation"
  | "preferences"
  | "inspiration"
  | "consent"
  | "prep"
  | "current-photos";

export type ExperienceOption = {
  id: ExperienceModuleId;
  name: string;
  shortDescription: string;
  icon: ExperienceOptionIcon;
  recommendedFor: ServiceCategoryId[];
};

export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    id: "consultation",
    name: "Consultation",
    shortDescription: "A few questions before the appointment.",
    icon: "consultation",
    recommendedFor: ["lashes", "brows", "nails", "makeup", "facials", "other"],
  },
  {
    id: "preferences",
    name: "Preferences",
    shortDescription: "Capture the look, style or finish they prefer.",
    icon: "preferences",
    recommendedFor: ["lashes", "brows", "nails", "makeup", "facials", "other"],
  },
  {
    id: "inspiration",
    name: "Inspiration photos",
    shortDescription: "Let clients share reference images before they arrive.",
    icon: "inspiration",
    recommendedFor: ["lashes", "brows", "nails", "makeup"],
  },
  {
    id: "consent",
    name: "Consent",
    shortDescription: "Include a simple consent acknowledgement in the client flow.",
    icon: "consent",
    recommendedFor: ["lashes", "brows", "nails", "facials"],
  },
  {
    id: "prep",
    name: "Prep",
    shortDescription: "Make sure clients know how to prepare before the appointment.",
    icon: "prep",
    recommendedFor: ["lashes", "brows", "makeup", "facials"],
  },
  {
    id: "current-photos",
    name: "Current photos",
    shortDescription: "Let clients upload current-condition/reference photos before arrival.",
    icon: "current-photos",
    recommendedFor: ["lashes", "brows", "makeup", "facials"],
  },
];

const EXPERIENCE_MODULE_IDS = new Set<ExperienceModuleId>(EXPERIENCE_OPTIONS.map((option) => option.id));

export function isExperienceModuleId(value: unknown): value is ExperienceModuleId {
  return typeof value === "string" && EXPERIENCE_MODULE_IDS.has(value as ExperienceModuleId);
}

export function getExperienceOption(id: ExperienceModuleId) {
  return EXPERIENCE_OPTIONS.find((option) => option.id === id);
}
