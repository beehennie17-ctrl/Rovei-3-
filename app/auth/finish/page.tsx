"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { readLegacyCallbackSession } from "@/lib/auth/confirmation-method";

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

    async function finish() {
      try {
        const supabase = createClient();

        const { data, error } =
          await supabase.auth.setSession({
            access_token: session!.accessToken,
            refresh_token: session!.refreshToken,
          });

        if (error || !data.session) {
          throw new Error("Session unavailable");
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("User unavailable");
        }

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
