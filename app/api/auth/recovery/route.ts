import { NextResponse } from "next/server";
import { z } from "zod";

import { mapAuthError } from "@/lib/auth/auth-errors";
import { backendErrorResponse, readJsonBody } from "@/lib/backend/errors";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const recoverySchema = z.object({
  email: z.string().trim().email().max(254),
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
    const { email } = recoverySchema.parse(await readJsonBody(request));
    const supabase = await createClient();
    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
      : new URL(request.url).origin;
    const redirectTo = new URL(
      "/auth/callback",
      siteOrigin,
    );
    redirectTo.searchParams.set(
      "next",
      "/login?recovery=complete",
    );

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase(),
      { redirectTo: redirectTo.toString() },
    );

    if (error) {
      if (
        error.code === "user_not_found" ||
        error.message.toLowerCase().includes("user not found")
      ) {
        return NextResponse.json({ sent: true });
      }

      const mapped = mapAuthError(error, "recovery");
      return NextResponse.json(
        { error: mapped.code, message: mapped.message },
        { status: mapped.status },
      );
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
