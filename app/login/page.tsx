import Link from "next/link";

import { Wordmark } from "@/components/branding/wordmark";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
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

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            New to Rovei?{" "}
            <Link
              href="/onboarding"
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
