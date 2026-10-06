export type AuthOperation =
  | "login"
  | "signup"
  | "recovery"
  | "session";

export type PublicAuthError = {
  status: number;
  code: string;
  message: string;
};

export function mapAuthError(
  error: { code?: string | null; message: string },
  operation: AuthOperation,
): PublicAuthError {
  const detail = `${error.code ?? ""} ${error.message}`.toLowerCase();

  if (
    detail.includes("email_not_confirmed") ||
    detail.includes("email not confirmed")
  ) {
    return {
      status: 403,
      code: "email_not_confirmed",
      message: "Confirm your email before signing in.",
    };
  }

  if (
    detail.includes("invalid_credentials") ||
    detail.includes("invalid login credentials")
  ) {
    return {
      status: 401,
      code: "invalid_credentials",
      message: "Email or password is incorrect.",
    };
  }

  if (
    detail.includes("user_already_exists") ||
    detail.includes("user already registered") ||
    detail.includes("already been registered")
  ) {
    return {
      status: 409,
      code: "account_exists",
      message: "An account may already exist for this email address.",
    };
  }

  if (
    detail.includes("weak_password") ||
    detail.includes("password should be")
  ) {
    return {
      status: 400,
      code: "weak_password",
      message: "Choose a stronger password and try again.",
    };
  }

  if (
    detail.includes("rate_limit") ||
    detail.includes("too many requests")
  ) {
    return {
      status: 429,
      code: "rate_limited",
      message: "Too many attempts. Please wait and try again.",
    };
  }

  if (
    operation === "login" &&
    (detail.includes("session_not_found") ||
      detail.includes("refresh_token_not_found"))
  ) {
    return {
      status: 401,
      code: "session_expired",
      message: "Your session has expired. Please sign in again.",
    };
  }

  return {
    status: operation === "session" ? 401 : 502,
    code: operation === "session" ? "session_expired" : "auth_unavailable",
    message:
      operation === "session"
        ? "Your session has expired. Please sign in again."
        : "Authentication is temporarily unavailable. Please try again.",
  };
}
