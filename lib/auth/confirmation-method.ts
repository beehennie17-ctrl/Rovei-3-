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
