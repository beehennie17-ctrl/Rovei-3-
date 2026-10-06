import { NextResponse } from "next/server";
import { z } from "zod";

import { mapAuthError } from "@/lib/auth/auth-errors";
import {
  backendErrorResponse,
  BackendError,
  readJsonBody,
} from "@/lib/backend/errors";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
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
    const body = loginSchema.parse(await readJsonBody(request));
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email.toLowerCase(),
      password: body.password,
    });

    if (error) {
      const mapped = mapAuthError(error, "login");
      return NextResponse.json(
        { error: mapped.code, message: mapped.message },
        { status: mapped.status },
      );
    }

    if (!data.user) {
      throw new BackendError(
        401,
        "invalid_credentials",
        "Email or password is incorrect.",
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("studio_members")
      .select("studio_id")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error("Unable to load studio membership after sign-in:", membershipError);
      throw new BackendError(
        500,
        "studio_lookup_failed",
        "Your account is signed in, but Rovei could not load your Studio.",
      );
    }

    return NextResponse.json({
      ok: true,
      hasStudio: Boolean(membership),
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
