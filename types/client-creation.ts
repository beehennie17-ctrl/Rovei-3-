import type { ServiceCategoryId } from "@/types/onboarding";

export type NewClientDraft = {
  firstName: string;
  lastName: string;
  service: ServiceCategoryId;
  appointmentDate: string;
  appointmentTime: string;
};
