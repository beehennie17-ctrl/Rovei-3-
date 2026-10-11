export type ConfirmationMethod =
  | "token_hash"
  | "code"
  | "invalid_type"
  | "missing";

export function selectEmailConfirmationMethod({
  code,
  tokenHash,
  type,
}: {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
}): ConfirmationMethod {
  if (tokenHash) {
    return type === "email" ? "token_hash" : "invalid_type";
  }

  return code ? "code" : "missing";
}


export function readLegacyCallbackSession(fragment: string) {
  if (!fragment.startsWith("#")) return null;

  const params = new URLSearchParams(fragment.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
}
