import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";
import { bootstrapStudio } from "@/lib/backend/studio-bootstrap";
import { studioSettingsSchema } from "@/lib/backend/schemas";
import { selectEmailConfirmationMethod } from "@/lib/auth/confirmation-method";

export async function GET(
  request: Request,
) {
  const url =
    new URL(request.url);

  const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : url.origin;

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");

  const method = selectEmailConfirmationMethod({
    code,
    tokenHash,
    type: url.searchParams.get("type"),
  });

  if (method === "missing" || method === "invalid_type") {
    const reason =
      method === "missing"
        ? "missing_confirmation"
        : "invalid_confirmation";

    return NextResponse.redirect(
      new URL(`/login?error=${reason}`, publicOrigin),
    );
  }

  const supabase = await createClient();

  const { error } =
    method === "token_hash"
      ? await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: "email",
        })
      : await supabase.auth.exchangeCodeForSession(code!);

  if (error) {
    console.error(
      "Rovei email/auth confirmation failed:",
      error.code ?? "unknown",
    );

    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", publicOrigin),
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/login?error=session", publicOrigin),
    );
  }

  const pendingStudio = studioSettingsSchema.safeParse(
    user.user_metadata?.rovei_studio_bootstrap,
  );

  if (pendingStudio.success) {
    try {
      await bootstrapStudio(supabase, pendingStudio.data);
    } catch (error) {
      console.error("Unable to finish Studio setup during auth callback:", error);
    }
  }

  return NextResponse.redirect(
    new URL("/", publicOrigin),
  );
}
