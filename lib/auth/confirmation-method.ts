export type ConfirmationMethod =
  | {
      kind: "token_hash";
      tokenHash: string;
      type: "email" | "signup";
    }
  | {
      kind: "code";
      code: string;
    }
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
    return type === "email" || type === "signup"
      ? { kind: "token_hash", tokenHash, type }
      : "invalid_type";
  }

  return code ? { kind: "code", code } : "missing";
}


export function readLegacyCallbackSession(fragment: string) {
  if (!fragment.startsWith("#")) return null;

  const params = new URLSearchParams(fragment.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
}
