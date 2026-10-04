"use client";

import {
  getBackendMode,
  type BackendMode,
} from "@/lib/backend/api-client";

import {
  createClient,
} from "@/lib/supabase/client";

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

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.signUp({
      email:
        credentials.email.trim(),

      password:
        credentials.password,

      options: {
        data: {
          full_name:
            credentials.firstName.trim(),

          first_name:
            credentials.firstName.trim(),
        },

        emailRedirectTo:
          `${window.location.origin}/auth/callback?next=/activate`,
      },
    });

  if (error) {
    throw error;
  }

  return {
    mode,

    needsEmailConfirmation:
      !data.session,
  };
}
