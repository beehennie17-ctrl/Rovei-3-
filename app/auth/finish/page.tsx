"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { readLegacyCallbackSession } from "@/lib/auth/confirmation-method";
import { completeBrowserEmailConfirmation } from "@/lib/auth/confirmation-flow";

export default function FinishAuthPage() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const session = readLegacyCallbackSession(
      window.location.hash,
    );

    // Clear sensitive tokens from the browser address/history.
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );

    if (!session) {
      window.location.replace(
        "/login?error=missing_confirmation",
      );
      return;
    }

    const confirmationSession = session;

    async function finish() {
      try {
        if (!confirmationSession) {
          throw new Error("User unavailable");
        }

        const user = await completeBrowserEmailConfirmation(
          createClient(),
          confirmationSession,
        );

        if (!user) throw new Error("Session unavailable");

        // The server determines paywall vs dashboard.
        window.location.replace("/");
      } catch {
        window.location.replace(
          "/login?error=confirmation_failed",
        );
      }
    }

    void finish();
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface-muted)] p-6">
      <p role="status" className="text-center text-lg font-medium">
        Finishing your Rovei confirmation…
      </p>
    </main>
  );
}
