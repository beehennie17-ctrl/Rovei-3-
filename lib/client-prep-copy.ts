import type { ServiceCategoryId } from "@/types/onboarding";

export const CLIENT_PREP_COPY: Record<ServiceCategoryId, string> = {
  lashes: "Arrive with the eye area clean and free of mascara or strip-lash adhesive where practical.",
  brows: "Arrive with the brow area clean and with minimal product where practical.",
  nails: "Bring any inspiration you'd like to reference and follow any removal or prep instructions your professional has already shared.",
  makeup: "If possible, arrive with a clean face and bring any inspiration you'd like to reference.",
  facials: "Arrive with clean skin where practical and follow any preparation instructions your professional has already shared.",
  other: "Follow any preparation instructions your professional has already shared.",
};

export function getClientPrepCopy(service: ServiceCategoryId): string {
  return CLIENT_PREP_COPY[service];
}
