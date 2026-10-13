"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, RefreshCw } from "lucide-react";
import { BillingToggle } from "@/components/activation/billing-toggle";
import { Wordmark } from "@/components/branding/wordmark";
import { Button } from "@/components/ui/button";
import { formatUsd, pricing, type BillingCadence } from "@/lib/pricing";

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (environment: "sandbox") => void };
      Initialize: (options: {
        token: string;
        eventCallback: (event: { name: string }) => void;
      }) => void;
      Checkout: {
        open: (options: {
          transactionId: string;
          settings?: { theme: "light" };
        }) => void;
      };
    };
  }
}

type BillingStatus = {
  status: string;
  billing: BillingCadence | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  scheduledCancelAt: string | null;
  accessActive: boolean;
};

type CheckoutExperienceProps = {
  initialBilling: BillingCadence;
  clientToken: string | null;
  configurationIssue: string | null;
};

function formatDate(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "Active",
    trialing: "Trial",
    past_due: "Payment needs attention",
    paused: "Paused",
    cancelled: "Cancelled",
    inactive: "Not yet active",
  };
  return labels[status] ?? "Status unavailable";
}

async function readResponseMessage(response: Response) {
  const result: unknown = await response.json().catch(() => null);
  if (
    result &&
    typeof result === "object" &&
    "message" in result &&
    typeof result.message === "string"
  ) {
    return result.message;
  }
  return "We couldn’t complete that billing request. Please try again.";
}

export function CheckoutExperience({
  initialBilling,
  clientToken,
  configurationIssue,
}: CheckoutExperienceProps) {
  const router = useRouter();
  const [billing, setBilling] = useState(initialBilling);
  const [subscription, setSubscription] = useState<BillingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [paddleReady, setPaddleReady] = useState(false);
  const initialized = useRef(false);

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError("");
    try {
      const response = await fetch("/api/billing/subscription", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (response.status === 401) {
        setSignedOut(true);
        setSubscription(null);
        return;
      }
      if (!response.ok) {
        throw new Error(await readResponseMessage(response));
      }
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== "object" ||
        !("status" in result) ||
        typeof result.status !== "string" ||
        !("billing" in result) ||
        (result.billing !== "monthly" && result.billing !== "annual" && result.billing !== null) ||
        !("currentPeriodStart" in result) ||
        (result.currentPeriodStart !== null && typeof result.currentPeriodStart !== "string") ||
        !("currentPeriodEnd" in result) ||
        (result.currentPeriodEnd !== null && typeof result.currentPeriodEnd !== "string") ||
        !("scheduledCancelAt" in result) ||
        (result.scheduledCancelAt !== null && typeof result.scheduledCancelAt !== "string") ||
        !("accessActive" in result) ||
        typeof result.accessActive !== "boolean"
      ) {
        throw new Error("Rovei returned an invalid billing status.");
      }
      setSubscription({
        status: result.status,
        billing: result.billing,
        currentPeriodStart: result.currentPeriodStart,
        currentPeriodEnd: result.currentPeriodEnd,
        scheduledCancelAt: result.scheduledCancelAt,
        accessActive: result.accessActive,
      });
      setSignedOut(false);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Unable to load billing details.");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const initializePaddle = useCallback(() => {
    if (!clientToken || !window.Paddle || initialized.current) return;
    window.Paddle.Environment.set("sandbox");
    window.Paddle.Initialize({
      token: clientToken,
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          router.push("/activate/checkout/complete");
        }
      },
    });
    initialized.current = true;
    setPaddleReady(true);
  }, [clientToken, router]);

  async function startCheckout() {
    if (!paddleReady || !window.Paddle || configurationIssue) {
      setActionError("Secure Sandbox checkout is not available yet. Please try again after configuration.");
      return;
    }

    setBusy(true);
    setActionError("");
    setNotice("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing }),
      });
      if (!response.ok) {
        throw new Error(await readResponseMessage(response));
      }
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== "object" ||
        !("transactionId" in result) ||
        typeof result.transactionId !== "string"
      ) {
        throw new Error("Paddle did not return a valid checkout session.");
      }
      window.Paddle.Checkout.open({
        transactionId: result.transactionId,
        settings: { theme: "light" },
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Secure checkout could not be opened.");
    } finally {
      setBusy(false);
    }
  }

  async function updateSubscription(action: "cancel" | "reactivate") {
    setBusy(true);
    setActionError("");
    setNotice("");
    try {
      const response = await fetch("/api/billing/manage", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        throw new Error(await readResponseMessage(response));
      }
      const result: unknown = await response.json();
      const message =
        result && typeof result === "object" && "message" in result &&
        typeof result.message === "string"
          ? result.message
          : "Paddle accepted the request. Your billing status will update when its signed notification arrives.";
      setNotice(message);
      setConfirmCancel(false);
      await refreshStatus();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Paddle could not update this subscription.");
    } finally {
      setBusy(false);
    }
  }

  const option = pricing[billing];
  const canPurchase =
    !subscription ||
    subscription.status === "inactive" ||
    subscription.status === "cancelled";
  const activeCancellation =
    subscription?.scheduledCancelAt &&
    ["active", "trialing"].includes(subscription.status);

  return (
    <>
      {clientToken && (
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
          onLoad={initializePaddle}
          onError={() => setActionError("Paddle’s secure checkout library could not be loaded. Check your connection and try again.")}
        />
      )}
      <main className="min-h-screen bg-[var(--surface-muted)] px-[var(--page-gutter)] py-6 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-[960px]">
          <header className="flex items-center justify-between gap-4">
            <Wordmark />
            <Link href="/activate" className="focus-ring motion-soft inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--wine-soft)]">
              <ArrowLeft size={15} aria-hidden="true" />
              <span>Back to plan</span>
            </Link>
          </header>

          <section className="mx-auto mt-12 max-w-2xl rounded-[2.2rem] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[var(--shadow-soft)] sm:mt-16 sm:px-10 sm:py-11">
            <p className="eyebrow">A considered next step</p>
            <h1 className="mt-4 text-[clamp(2.6rem,7vw,4.4rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)]">
              Your Studio, <span className="editorial-accent text-[var(--wine)]">beautifully supported.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              Secure payment is handled by Paddle. Rovei only activates paid Studio access after a verified subscription update.
            </p>

            {statusLoading ? (
              <div className="mt-8 h-24 animate-pulse rounded-[1.5rem] bg-[var(--surface-muted)]" aria-label="Loading billing status" />
            ) : statusError ? (
              <div role="alert" className="mt-8 rounded-[1.5rem] border border-[var(--blush)] bg-[var(--rose-milk)]/30 p-5 text-sm leading-6 text-[var(--text-primary)]">
                <p className="font-semibold">Billing details could not be verified.</p>
                <p className="mt-1 text-[var(--text-secondary)]">{statusError}</p>
                <Button type="button" onClick={() => void refreshStatus()} className="mt-4">
                  <RefreshCw size={15} aria-hidden="true" /> Try again
                </Button>
              </div>
            ) : signedOut ? (
              <div role="status" className="mt-8 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
                <p className="font-semibold text-[var(--text-primary)]">Sign in to continue securely.</p>
                <Link href="/login?next=%2Factivate%2Fcheckout" className="focus-ring mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white">
                  Sign in to Rovei <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            ) : subscription && subscription.status !== "inactive" ? (
              <div className="mt-8 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Rovei. Studio billing</p>
                    <p className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">
                      {subscription.billing ? pricing[subscription.billing].label : "Studio"} plan
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--blush)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--wine)]">
                    {statusLabel(subscription.status)}
                  </span>
                </div>
                <dl className="mt-5 grid gap-4 border-t border-[var(--border-soft)] pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--text-secondary)]">Current period began</dt>
                    <dd className="mt-1 font-semibold text-[var(--text-primary)]">{formatDate(subscription.currentPeriodStart)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">{activeCancellation ? "Access through" : "Next billing date"}</dt>
                    <dd className="mt-1 font-semibold text-[var(--text-primary)]">{formatDate(subscription.scheduledCancelAt ?? subscription.currentPeriodEnd)}</dd>
                  </div>
                </dl>

                {activeCancellation && (
                  <p className="mt-5 rounded-xl border border-[var(--blush)] bg-white p-4 text-sm leading-6 text-[var(--text-secondary)]">
                    Cancellation is scheduled for {formatDate(subscription.scheduledCancelAt)}. Your Studio remains available until then.
                  </p>
                )}

                {subscription.status === "past_due" && (
                  <p className="mt-5 rounded-xl border border-[var(--blush)] bg-white p-4 text-sm leading-6 text-[var(--text-secondary)]">
                    Paddle reports a past-due payment. Rovei will keep paid Studio access protected until Paddle confirms an active subscription. Please contact Support for billing assistance.
                  </p>
                )}

                {subscription.status === "paused" && (
                  <p className="mt-5 rounded-xl border border-[var(--blush)] bg-white p-4 text-sm leading-6 text-[var(--text-secondary)]">
                    This subscription is paused by Paddle. Contact Support for help with the next step; a new subscription will not be created automatically.
                  </p>
                )}

                {subscription.status === "cancelled" && (
                  <p className="mt-5 rounded-xl border border-[var(--blush)] bg-white p-4 text-sm leading-6 text-[var(--text-secondary)]">
                    This subscription has ended and cannot be reactivated. Choose a plan below to begin a new subscription.
                  </p>
                )}

                {["active", "trialing"].includes(subscription.status) && !activeCancellation && (
                  confirmCancel ? (
                    <div className="mt-5 rounded-xl border border-[var(--blush)] bg-white p-4">
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        We’ll ask Paddle to end renewal at the close of your current billing period. No immediate cancellation or refund is requested.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button type="button" disabled={busy} onClick={() => void updateSubscription("cancel")}>
                          Confirm scheduled cancellation
                        </Button>
                        <button type="button" className="focus-ring rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]" onClick={() => setConfirmCancel(false)}>
                          Keep subscription
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmCancel(true)}
                      className="focus-ring mt-5 min-h-11 rounded-full border border-[var(--border-soft)] px-5 text-sm font-semibold text-[var(--wine)] hover:bg-white disabled:opacity-60"
                    >
                      Schedule cancellation
                    </button>
                  )
                )}

                {activeCancellation && (
                  <Button type="button" disabled={busy} onClick={() => void updateSubscription("reactivate")} className="mt-5">
                    Keep my subscription
                  </Button>
                )}
              </div>
            ) : null}

            {!statusLoading && !statusError && !signedOut && canPurchase && (
              <>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Choose your billing rhythm</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">One Studio plan, with no trial.</p>
                  </div>
                  <BillingToggle value={billing} onChange={setBilling} />
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5 sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Rovei. Studio</p>
                      <p className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">{option.label} billing</p>
                    </div>
                    <p className="text-2xl font-bold tracking-[-0.04em] text-[var(--wine)]">
                      {formatUsd(option.price)}<span className="text-sm font-semibold tracking-normal text-[var(--text-secondary)]">/{option.billingLabel}</span>
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{option.billedCopy} Paddle displays the final amount and applicable taxes before you pay.</p>
                </div>

                {configurationIssue && (
                  <div role="status" className="mt-5 rounded-xl border border-[var(--blush)] bg-[var(--rose-milk)]/30 p-4 text-sm leading-6 text-[var(--text-secondary)]">
                    <p className="font-semibold text-[var(--text-primary)]">Sandbox checkout is not configured yet.</p>
                    <p className="mt-1">{configurationIssue}</p>
                  </div>
                )}

                {actionError && <p role="alert" className="mt-4 text-sm leading-6 text-[var(--wine)]">{actionError}</p>}
                {notice && <p role="status" className="mt-4 text-sm leading-6 text-[var(--wine)]">{notice}</p>}

                {!configurationIssue && (
                  <Button type="button" disabled={busy || !paddleReady} onClick={() => void startCheckout()} className="mt-6 w-full sm:w-auto">
                    <LockKeyhole size={16} aria-hidden="true" />
                    <span>{busy ? "Preparing secure checkout…" : "Continue to secure checkout"}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                )}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs leading-5 text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1"><Check size={13} aria-hidden="true" />Cancel anytime.</span>
                  <span>No setup fee.</span>
                  <span>Studio access follows server-confirmed billing status.</span>
                </div>
              </>
            )}

            {actionError && !canPurchase && <p role="alert" className="mt-4 text-sm leading-6 text-[var(--wine)]">{actionError}</p>}
            {notice && !canPurchase && <p role="status" className="mt-4 text-sm leading-6 text-[var(--wine)]">{notice}</p>}

            <div className="mt-7 border-t border-[var(--border-soft)] pt-5 text-xs leading-5 text-[var(--text-secondary)]">
              Payment information is entered directly with Paddle. Opening checkout does not activate Rovei or create paid access.
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
