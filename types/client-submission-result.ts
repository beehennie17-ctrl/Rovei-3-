import type { ClientStatus, ClientTheme } from "@/types";
import type {
  ClientAppointmentFeel,
  ClientFinishPreference,
  PrototypePhotoKind,
  PrototypePhotoRecord,
} from "@/types/client-experience";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

export type ClientSubmissionReadinessState = "complete" | "waiting" | "unavailable" | "neutral";

export type ClientSubmissionReadinessRow = {
  id: string;
  moduleId?: ExperienceModuleId;
  label: string;
  value: string;
  state: ClientSubmissionReadinessState;
};

export type ClientSubmissionResult = {
  token: string;
  clientName: string;
  initials: string;
  clientType: "New client";
  serviceId: ServiceCategoryId;
  service: string;
  appointmentDateLabel: string;
  appointmentTimeLabel: string;
  status: Extract<ClientStatus, "ready" | "waiting">;
  theme: ClientTheme;
  enabledModules: ExperienceModuleId[];
  completedModuleCount: number;
  totalModuleCount: number;
  consultation?: {
    goal: string;
  };
  preferences?: {
    finish: ClientFinishPreference;
    finishLabel: string;
    appointmentFeel: ClientAppointmentFeel;
    appointmentFeelLabel: string;
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
  submittedAt?: string;
};

export type ReconciledPrototypePhotos = {
  kind: PrototypePhotoKind;
  requestedCount: number;
  photos: PrototypePhotoRecord[];
  missingCount: number;
};
