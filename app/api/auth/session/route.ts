import { NextResponse } from "next/server";

import { mapAuthError } from "@/lib/auth/auth-errors";
import { backendErrorResponse, BackendError } from "@/lib/backend/errors";
import { studioSettingsSchema } from "@/lib/backend/schemas";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const mapped = mapAuthError(
        authError ?? { message: "session_not_found" },
        "session",
      );
      return NextResponse.json(
        { error: mapped.code, message: mapped.message },
        { status: mapped.status },
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("studio_members")
      .select("studio_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error("Unable to restore studio membership:", membershipError);
      throw new BackendError(
        500,
        "studio_lookup_failed",
        "Unable to restore your Studio session.",
      );
    }

    const bootstrap = studioSettingsSchema.safeParse(
      user.user_metadata?.rovei_studio_bootstrap,
    );

    return NextResponse.json(
      {
        authenticated: true,
        userId: user.id,
        studioId: membership?.studio_id ?? null,
        pendingStudio: bootstrap.success ? bootstrap.data : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
