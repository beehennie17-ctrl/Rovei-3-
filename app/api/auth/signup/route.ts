import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const signupSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        code: "backend_not_configured",
        message: "Rovei authentication is not configured.",
      },
      { status: 503 },
    );
  }

  let body: z.infer<typeof signupSchema>;

  try {
    body = signupSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        code: "invalid_signup",
        message: "Please check your signup details.",
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const origin = new URL(request.url).origin;

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        first_name: body.firstName,
      },
      emailRedirectTo:
        `${origin}/auth/callback?next=/?rovei=complete-signup`,
    },
  });

  if (error) {
    return NextResponse.json(
      {
        code: "signup_failed",
        message: error.message,
      },
      { status: 400 },
    );
  }

  if (
    data.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    return NextResponse.json(
      {
        code: "account_may_exist",
        message: "An account may already exist for this email address.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    requiresEmailConfirmation: !data.session,
  });
}
