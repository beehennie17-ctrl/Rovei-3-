import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";
import { getSafeNext } from "@/lib/auth/safe-next";
import { bootstrapStudio } from "@/lib/backend/studio-bootstrap";
import { studioSettingsSchema } from "@/lib/backend/schemas";

export async function GET(
  request: Request,
) {
  const url =
    new URL(request.url);

  const code =
    url.searchParams.get(
      "code",
    );

  const next =
    getSafeNext(
      url.searchParams.get(
        "next",
      ),
    );

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=oauth",
        url.origin,
      ),
    );
  }

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.auth.exchangeCodeForSession(
      code,
    );

  if (error) {
    return NextResponse.redirect(
      new URL(
        "/login?error=oauth",
        url.origin,
      ),
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/login?error=session", url.origin),
    );
  }

  const pendingStudio = studioSettingsSchema.safeParse(
    user.user_metadata?.rovei_studio_bootstrap,
  );

  if (pendingStudio.success) {
    try {
      await bootstrapStudio(supabase, pendingStudio.data);
    } catch {
      return NextResponse.redirect(
        new URL("/activate?bootstrap=retry", url.origin),
      );
    }
  }

  return NextResponse.redirect(
    new URL(
      next,
      url.origin,
    ),
  );
}
