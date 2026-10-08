import { NextResponse } from "next/server";
import { z } from "zod";

import { mapAuthError } from "@/lib/auth/auth-errors";
import { backendErrorResponse, readJsonBody } from "@/lib/backend/errors";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { studioSettingsSchema } from "@/lib/backend/schemas";
import {
  getEmailConfirmationRedirect,
  requiresEmailConfirmation,
} from "@/lib/auth/locked-shell";

const signupSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(200),
  studioBootstrap: studioSettingsSchema,
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

  let body: z.infer<typeof signupSchema>;

  try {
    body = signupSchema.parse(await readJsonBody(request));
  } catch {
    return NextResponse.json(
      {
        error: "invalid_signup",
        message: "Please check your signup details.",
      },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
      : new URL(request.url).origin;

    const { data, error } = await supabase.auth.signUp({
      email: body.email.trim().toLowerCase(),
      password: body.password,
      options: {
        data: {
          first_name: body.firstName,
          full_name: body.firstName,
          ...(body.studioBootstrap
            ? { rovei_studio_bootstrap: body.studioBootstrap }
            : {}),
        },
        emailRedirectTo: getEmailConfirmationRedirect(origin),
      },
    });

    if (error) {
      const mapped = mapAuthError(error, "signup");

      return NextResponse.json(
        {
          error: mapped.code,
          message: mapped.message,
        },
        { status: mapped.status },
      );
    }

    if (
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      return NextResponse.json(
        {
          error: "account_may_exist",
          message: "An account may already exist for this email address.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      requiresEmailConfirmation: requiresEmailConfirmation(data.session),
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
