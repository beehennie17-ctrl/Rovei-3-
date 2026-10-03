"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function handlePasswordLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.replace("/app");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: authError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      if (authError) {
        setError(authError.message);
        setGoogleLoading(false);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to continue with Google.",
      );

      setGoogleLoading(false);
    }
  }

  return (
    <div className="mt-8 grid gap-4">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="min-h-12 rounded-full border border-[var(--border-soft)] bg-white px-5 text-sm font-bold text-[var(--text-primary)] shadow-sm transition hover:-translate-y-0.5"
      >
        {googleLoading
          ? "Opening Google…"
          : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border-soft)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          or
        </span>
        <div className="h-px flex-1 bg-[var(--border-soft)]" />
      </div>

      <form
        onSubmit={handlePasswordLogin}
        className="grid gap-4"
      >
        <label className="grid gap-2">
          <span className="text-sm font-bold">
            Email
          </span>

          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="min-h-12 rounded-2xl border border-[var(--border-soft)] bg-white px-4 outline-none transition focus:border-[var(--wine)]"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold">
            Password
          </span>

          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="min-h-12 rounded-2xl border border-[var(--border-soft)] bg-white px-4 outline-none transition focus:border-[var(--wine)]"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="min-h-12 rounded-full bg-[var(--wine)] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
