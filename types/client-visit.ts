import type { ServiceCategoryId } from "@/types/onboarding";

export type PrototypeVisitPhotoKind = "before" | "after";

export type PrototypeVisitRecord = {
  id: string;
  service: ServiceCategoryId;
  appointmentDate: string;
  appointmentTime: string;
  summary: string;
  beforePhotoIds: string[];
  afterPhotoIds: string[];
  completedAt: string;
};

export type ClientVisitPrototype = {
  token: string;
  visits: PrototypeVisitRecord[];
  updatedAt: string;
};

export type PrototypeVisitPhotoRecord = {
  id: string;
  token: string;
  visitId: string;
  kind: PrototypeVisitPhotoKind;
  name: string;
  type: string;
  size: number;
  blob: Blob;
};

export type ReconciledVisitPhotos = {
  kind: PrototypeVisitPhotoKind;
  requestedCount: number;
  photos: PrototypeVisitPhotoRecord[];
  missingCount: number;
};
