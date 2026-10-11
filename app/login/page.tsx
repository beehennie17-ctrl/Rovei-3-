import Link from "next/link";

import { Wordmark } from "@/components/branding/wordmark";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; error?: string }>;
}) {
  const { reason, error } = await searchParams;

  const confirmationMessages: Record<string, string> = {
    missing_confirmation:
      "This confirmation link did not contain a valid sign-in code.",
    invalid_confirmation:
      "This email confirmation link is not valid.",
    confirmation_failed:
      "This confirmation link has expired or could not be verified. If your email is already confirmed, log in below.",
    oauth:
      "We could not complete this sign-in. Please try again.",
    session:
      "Your session could not be established. Please log in again.",
  };

  const confirmationError = error
    ? confirmationMessages[error]
    : undefined;

  return (
    <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-7">
      <div className="mx-auto max-w-[1120px]">
        <Wordmark />

        <section className="mx-auto mt-16 max-w-lg rounded-[2rem] border border-[var(--border-soft)] bg-white p-7 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="eyebrow">Welcome back</p>

          <h1 className="mt-4 text-[clamp(2.7rem,7vw,4.6rem)] font-bold leading-[0.94] tracking-[-0.05em]">
            Back to your{" "}
            <span className="editorial-accent text-[var(--wine)]">
              studio.
            </span>
          </h1>

          <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">
            Sign in to manage your clients,
            appointments and client memory.
          </p>

          <LoginForm />

          {confirmationError ? (
            <p
              role="alert"
              className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {confirmationError}
            </p>
          ) : null}

          {reason === "account-exists" ? (
            <p className="mt-5 rounded-2xl bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
              If you already have an account, sign in or reset your
              password. Otherwise, you can continue creating your Studio.
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            New to Rovei?{" "}
            <Link
              href="/?rovei=onboarding"
              className="font-bold text-[var(--wine)]"
            >
              Create your studio
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
