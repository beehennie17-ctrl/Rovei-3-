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

    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(
      window.location.hash.slice(1),
    );
    const code = query.get("code");
    const hasError = query.has("error") || fragment.has("error");

    // Remove sensitive confirmation information from browser history.
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );

    if (hasError || (!session && !code)) {
      window.location.replace(
        hasError
          ? "/login?error=confirmation_failed"
          : "/login?error=missing_confirmation",
      );
      return;
    }

    async function finish() {
      try {
        const supabase = createClient();

        if (session) {
          const user = await completeBrowserEmailConfirmation(
            supabase,
            session,
          );

          if (!user) {
            throw new Error("Unable to establish confirmation session");
          }
        } else if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) throw error;

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            throw new Error("Unable to validate confirmed user");
          }
        } else {
          throw new Error("Missing confirmation response");
        }

        // The server restores the Studio and checks subscription access.
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
