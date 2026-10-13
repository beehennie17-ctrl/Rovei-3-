"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, RefreshCw } from "lucide-react";
import { Wordmark } from "@/components/branding/wordmark";
import { Button } from "@/components/ui/button";

type ConfirmationStatus = {
  status: string;
  accessActive: boolean;
  currentPeriodEnd: string | null;
};

export function PaymentConfirmation() {
  const [result, setResult] = useState<ConfirmationStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const verify = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/billing/subscription", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        const message =
          data && typeof data === "object" && "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Sign in to verify your billing status.";
        throw new Error(message);
      }
      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== "object" ||
        !("status" in data) ||
        typeof data.status !== "string" ||
        !("accessActive" in data) ||
        typeof data.accessActive !== "boolean" ||
        !("currentPeriodEnd" in data) ||
        (data.currentPeriodEnd !== null && typeof data.currentPeriodEnd !== "string")
      ) {
        throw new Error("Rovei returned an invalid billing status.");
      }
      setResult({
        status: data.status,
        accessActive: data.accessActive,
        currentPeriodEnd: data.currentPeriodEnd,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify payment status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void verify();
  }, [verify]);

  const confirmed = result?.accessActive === true &&
    (result.status === "active" || result.status === "trialing");

  return (
    <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-[960px]">
        <header><Wordmark /></header>
        <section aria-live="polite" className="mx-auto mt-16 max-w-2xl rounded-[2.2rem] border border-[var(--border-soft)] bg-white px-6 py-10 shadow-[var(--shadow-soft)] sm:px-10 sm:py-12">
          {confirmed ? (
            <>
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]">
                <Check size={22} aria-hidden="true" />
              </span>
              <p className="eyebrow mt-6">Payment confirmed</p>
              <h1 className="mt-4 text-[clamp(2.6rem,7vw,4.3rem)] font-bold leading-[0.96] tracking-[-0.05em]">
                Your Studio is <span className="editorial-accent text-[var(--wine)]">ready.</span>
              </h1>
              <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">
                Paddle has confirmed your subscription and Rovei has verified the active billing status. Your Studio access is now available.
              </p>
              <Link href="/app" className="focus-ring motion-soft mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--wine)] px-6 text-sm font-semibold text-white hover:opacity-90">
                Continue to Studio
              </Link>
            </>
          ) : (
            <>
              <p className="eyebrow">{loading ? "Verifying with Rovei" : "Confirmation in progress"}</p>
              <h1 className="mt-4 text-[clamp(2.6rem,7vw,4.3rem)] font-bold leading-[0.96] tracking-[-0.05em]">
                Almost <span className="editorial-accent text-[var(--wine)]">there.</span>
              </h1>
              <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">
                {error
                  ? error
                  : result?.status === "past_due"
                    ? "Paddle has not confirmed an active subscription. Studio access remains protected; please contact Support for help."
                    : "We’re waiting for Paddle’s signed subscription update. Opening or completing a checkout in your browser does not activate Studio access on its own."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" disabled={loading} onClick={() => void verify()}>
                  <RefreshCw size={15} aria-hidden="true" /> Check billing status
                </Button>
                <Link href="/activate/checkout" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] px-5 text-sm font-semibold text-[var(--wine)]">
                  Return to billing
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
