import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

const SAFE_BASELINE: ExperienceModuleId[] = ["consultation", "preferences"];

export function getRecommendedExperienceModules(
  services: ServiceCategoryId[],
): ExperienceModuleId[] {
  if (services.length === 0) return [...SAFE_BASELINE];

  const selectedServices = new Set(services);
  return EXPERIENCE_OPTIONS
    .filter((option) => option.recommendedFor.some((serviceId) => selectedServices.has(serviceId)))
    .map((option) => option.id);
}
