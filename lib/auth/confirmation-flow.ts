import type { SupabaseClient } from "@supabase/supabase-js";

import { selectEmailConfirmationMethod } from "./confirmation-method.ts";

export type ServerConfirmationResult =
  | { kind: "fragment_handoff" }
  | { kind: "invalid_confirmation" }
  | { kind: "confirmation_failed"; errorCode: string }
  | { kind: "session_failed" }
  | {
      kind: "confirmed";
      user: NonNullable<
        Awaited<ReturnType<SupabaseClient["auth"]["getUser"]>>["data"]["user"]
      >;
    };

export async function completeServerEmailConfirmation(
  supabase: SupabaseClient,
  params: URLSearchParams,
): Promise<ServerConfirmationResult> {
  const method = selectEmailConfirmationMethod({
    code: params.get("code"),
    tokenHash: params.get("token_hash"),
    type: params.get("type"),
  });

  if (method === "missing") {
    return { kind: "fragment_handoff" };
  }

  if (method === "invalid_type") {
    return { kind: "invalid_confirmation" };
  }

  const { error } =
    method.kind === "token_hash"
      ? await supabase.auth.verifyOtp({
          token_hash: method.tokenHash,
          type: method.type,
        })
      : await supabase.auth.exchangeCodeForSession(method.code);

  if (error) {
    return {
      kind: "confirmation_failed",
      errorCode: error.code ?? "unknown",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { kind: "session_failed" };
  }

  return { kind: "confirmed", user };
}

export async function completeBrowserEmailConfirmation(
  supabase: SupabaseClient,
  session: { accessToken: string; refreshToken: string },
) {
  const { data, error } = await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });

  if (error || !data.session) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  return userError ? null : user;
}
