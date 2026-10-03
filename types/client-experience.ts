import type { ExperienceModuleId } from "@/types/onboarding";

export type ClientFinishPreference =
  | "natural"
  | "soft"
  | "defined"
  | "glam"
  | "not-sure";

export type ClientAppointmentFeel = "quiet" | "chatty" | "no-preference";
export type ClientExperienceStatus = "in-progress" | "complete";
export type PrototypePhotoKind = "inspiration" | "current";

export type ClientExperiencePrototype = {
  token: string;
  modules: ExperienceModuleId[];
  status: ClientExperienceStatus;
  /** -1 = welcome, 0..modules.length-1 = module, modules.length = review. */
  currentStep: number;
  consultation?: {
    goal: string;
  };
  preferences?: {
    finish?: ClientFinishPreference;
    appointmentFeel?: ClientAppointmentFeel;
  };
  inspiration?: {
    skipped: boolean;
    photoIds: string[];
  };
  currentPhotos?: {
    skipped: boolean;
    photoIds: string[];
  };
  consent?: {
    acknowledged: boolean;
  };
  prep?: {
    acknowledged: boolean;
  };
  updatedAt: string;
  submittedAt?: string;
};

export type PrototypePhotoRecord = {
  id: string;
  token: string;
  kind: PrototypePhotoKind;
  name: string;
  type: string;
  size: number;
  blob: Blob;
};
