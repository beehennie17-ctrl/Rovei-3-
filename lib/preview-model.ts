import { getExperienceOption } from "@/lib/experience-options";
import { getRecommendedExperienceModules } from "@/lib/experience-recommendations";
import { getServiceCategory } from "@/lib/service-categories";
import { resolveClientTheme } from "@/lib/theme-resolver";
import { clientThemes } from "@/lib/themes";
import type { ClientTheme, ThemeName } from "@/types";
import type { ExperienceModuleId, OnboardingDraft, ServiceCategoryId } from "@/types/onboarding";

export type PreviewService = {
  id: ServiceCategoryId;
  name: string;
};

export type PreviewExperienceStep = {
  id: ExperienceModuleId;
  name: string;
  description: string;
};

export type PreviewClientCardRow = {
  id: string;
  label: string;
  value: string;
};

export type PersonalPreviewModel = {
  studioName: string;
  hasStudioName: boolean;
  services: PreviewService[];
  serviceNames: string[];
  serviceLabel: string;
  themeName: ThemeName;
  themeLabel: string;
  theme: ClientTheme;
  experience: PreviewExperienceStep[];
  clientCardRows: PreviewClientCardRow[];
  experienceWasExplicitlySaved: boolean;
  isDraftEmpty: boolean;
};

const CLIENT_CARD_VALUES: Record<ExperienceModuleId, string> = {
  consultation: "Complete",
  preferences: "Complete",
  inspiration: "3 photos",
  consent: "Complete",
  prep: "Viewed",
  "current-photos": "2 photos",
};

export function buildPersonalPreviewModel(draft: Partial<OnboardingDraft>): PersonalPreviewModel {
  const studioName = draft.studioName?.trim() || "Your Studio";
  const serviceIds = draft.services ?? [];
  const services = serviceIds
    .map((id) => {
      const category = getServiceCategory(id);
      return category ? { id, name: category.name } : null;
    })
    .filter((service): service is PreviewService => service !== null);

  const themeName = draft.theme ?? "wine";
  const theme = resolveClientTheme(themeName, draft.customPrimary);
  const themeLabel = clientThemes[themeName]?.name ?? "Wine";
  const experienceIds = draft.experienceSelections !== undefined
    ? draft.experienceSelections
    : getRecommendedExperienceModules(serviceIds);
  const experience = experienceIds
    .map((id) => {
      const option = getExperienceOption(id);
      return option
        ? { id, name: option.name, description: option.shortDescription }
        : null;
    })
    .filter((step): step is PreviewExperienceStep => step !== null);

  const clientCardRows = experience.map((step) => ({
    id: step.id,
    label: step.name,
    value: CLIENT_CARD_VALUES[step.id],
  }));

  const isDraftEmpty = !draft.studioName?.trim()
    && serviceIds.length === 0
    && draft.theme === undefined
    && draft.customPrimary === undefined
    && draft.experienceSelections === undefined;

  return {
    studioName,
    hasStudioName: Boolean(draft.studioName?.trim()),
    services,
    serviceNames: services.map((service) => service.name),
    serviceLabel: services[0]?.name ?? "Appointment",
    themeName,
    themeLabel,
    theme,
    experience,
    clientCardRows,
    experienceWasExplicitlySaved: draft.experienceSelections !== undefined,
    isDraftEmpty,
  };
}
