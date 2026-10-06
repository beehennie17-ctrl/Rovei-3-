import { NextResponse } from "next/server";

import {
  backendErrorResponse,
  BackendError,
  requireSameOrigin,
} from "@/lib/backend/errors";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "backend_not_configured",
        message: "Rovei authentication is not configured.",
      },
      { status: 503 },
    );
  }

  try {
    requireSameOrigin(request);
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      console.error("Supabase sign-out failed:", error);
      throw new BackendError(
        502,
        "signout_failed",
        "Rovei could not securely end your session. Please try again.",
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
