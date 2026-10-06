"use client";

import {
  getBackendMode,
  type BackendMode,
  fetchBackendJson,
} from "@/lib/backend/api-client";
import type { StudioSettingsState } from "@/lib/studio-settings";

export type SignupCredentials = {
  firstName: string;
  email: string;
  password: string;
};

export type SignupResult = {
  mode: BackendMode;
  needsEmailConfirmation: boolean;
};

export async function createRoveiAccount(
  credentials:
    SignupCredentials,
  studioBootstrap?: StudioSettingsState & { timezone: string },
): Promise<SignupResult> {
  const mode =
    await getBackendMode();

  if (mode === "prototype") {
    return {
      mode,
      needsEmailConfirmation:
        false,
    };
  }

  const result = await fetchBackendJson<{
    requiresEmailConfirmation: boolean;
  }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      ...credentials,
      studioBootstrap,
    }),
  });

  return {
    mode,
    needsEmailConfirmation: result.requiresEmailConfirmation,
  };
}
