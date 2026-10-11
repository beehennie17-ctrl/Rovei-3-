import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";
import { bootstrapStudio } from "@/lib/backend/studio-bootstrap";
import { studioSettingsSchema } from "@/lib/backend/schemas";
import { completeServerEmailConfirmation } from "@/lib/auth/confirmation-flow";
import { getConfiguredPublicOrigin } from "@/lib/auth/public-origin";

export async function GET(
  request: Request,
) {
  const url =
    new URL(request.url);

  const publicOrigin = getConfiguredPublicOrigin();

  if (!publicOrigin) {
    return NextResponse.json(
      {
        error: "public_origin_not_configured",
        message: "Rovei email confirmation is temporarily unavailable.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const confirmation = await completeServerEmailConfirmation(
    supabase,
    url.searchParams,
  );

  if (confirmation.kind === "fragment_handoff") {
    // A default Supabase email link may return the session
    // in a URL fragment, which only the browser can read.
    return NextResponse.redirect(
      new URL("/auth/finish", publicOrigin),
    );
  }

  if (confirmation.kind === "invalid_confirmation") {
    return NextResponse.redirect(
      new URL("/login?error=invalid_confirmation", publicOrigin),
    );
  }

  if (confirmation.kind === "confirmation_failed") {
    console.error(
      "Rovei email/auth confirmation failed:",
      confirmation.errorCode,
    );

    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", publicOrigin),
    );
  }

  if (confirmation.kind === "session_failed") {
    return NextResponse.redirect(
      new URL("/login?error=session", publicOrigin),
    );
  }

  const pendingStudio = studioSettingsSchema.safeParse(
    confirmation.user.user_metadata?.rovei_studio_bootstrap,
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
