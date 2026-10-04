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

export type CloudClientExperienceResponse =
  Omit<
    ClientExperiencePrototype,
    "token"
  >;

export type PublicClientExperienceData = {
  clientExperienceId: string;
  studioName: string;
  draft:
    import("@/types/client-creation").NewClientDraft;
  theme:
    import("@/types").ThemeName;
  customPrimary: string;
  response:
    CloudClientExperienceResponse;
  expiresAt: string;
};

export type CloudClientPhoto = {
  id: string;
  kind: PrototypePhotoKind;
  name: string;
  type: string;
  size: number;
  previewUrl: string;
  createdAt: string;
};
