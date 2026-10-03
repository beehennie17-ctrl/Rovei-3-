import type { ClientDirectoryRecord } from "@/types/clients";

export type ClientReadinessItem = {
  id: string;
  label: string;
  value: string;
  complete: boolean;
};

export type ClientPreference = {
  id: string;
  label: string;
  value: string;
};

export type ClientFormRecord = {
  id: string;
  label: string;
  status: string;
  complete: boolean;
};

export type ClientVisitRecord = {
  id: string;
  date: string;
  service: string;
  summary: string;
};

export type ClientPhotoRecord = {
  id: string;
  type: "Before" | "After" | "Inspiration" | "Current";
  context: string;
};

export type ClientNoteRecord = {
  id: string;
  dateLabel: string;
  text: string;
};

export type ClientProfileDetails = {
  readinessItems: ClientReadinessItem[];
  preferences: ClientPreference[];
  forms: ClientFormRecord[];
  visits: ClientVisitRecord[];
  photos: ClientPhotoRecord[];
  notes: ClientNoteRecord[];
};

/**
 * Frontend-only Client Profile view model. Shared identity/appointment facts
 * originate from the Clients Directory record; profile-specific demo memory
 * enriches that canonical record for presentation only.
 */
export type ClientProfileViewModel = ClientDirectoryRecord & ClientProfileDetails;
