import { NextResponse } from "next/server";
import { z } from "zod";

import {
  backendErrorResponse,
  BackendError,
  readJsonBody,
  requireSameOrigin,
} from "@/lib/backend/errors";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const passwordSchema = z.object({
  password: z.string().min(8).max(200),
});

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
    const { password } = passwordSchema.parse(await readJsonBody(request));
    const supabase = await createClient();
    const { data: current, error: sessionError } =
      await supabase.auth.getUser();

    if (sessionError || !current.user) {
      throw new BackendError(
        401,
        "not_authenticated",
        "Your password reset session is invalid or expired.",
      );
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("Supabase password update failed:", error);
      throw new BackendError(
        502,
        "password_update_failed",
        "Rovei could not update your password. Please try again.",
      );
    }

    return NextResponse.json({ updated: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
