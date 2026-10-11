import "server-only";

import {
  BackendError,
} from "@/lib/backend/errors";

import {
  isSupabaseConfigured,
} from "@/lib/supabase/config";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getStudioSubscriptionAccess,
} from "@/lib/backend/subscription-access";

export async function requireAuthenticatedUser() {
  if (!isSupabaseConfigured()) {
    throw new BackendError(
      503,
      "backend_not_configured",
      "The Rovei cloud backend has not been connected yet.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: { user },
    error,
  } =
    await supabase.auth.getUser();

  if (error || !user) {
    throw new BackendError(
      401,
      "not_authenticated",
      "You must be signed in.",
    );
  }

  return {
    supabase,
    user,
  };
}

export async function requireStudioContext() {
  const {
    supabase,
    user,
  } =
    await requireAuthenticatedUser();

  const {
    data: membership,
    error,
  } = await supabase
    .from("studio_members")
    .select(
      "studio_id, role",
    )
    .eq(
      "user_id",
      user.id,
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new BackendError(
      500,
      "studio_lookup_failed",
      "Unable to load your Studio.",
    );
  }

  if (!membership) {
    throw new BackendError(
      409,
      "studio_not_created",
      "Your Rovei Studio has not been created yet.",
    );
  }

  const subscriptionAccess = await getStudioSubscriptionAccess(
    supabase,
    membership.studio_id,
  );

  if (subscriptionAccess.error) {
    console.error(
      "Unable to verify Studio subscription:",
      subscriptionAccess.error,
    );
    throw new BackendError(
      500,
      "subscription_lookup_failed",
      "Unable to verify your Rovei subscription.",
    );
  }

  if (!subscriptionAccess.allowed) {
    throw new BackendError(
      402,
      "subscription_required",
      "An active Rovei subscription is required to access Studio data.",
    );
  }

  return {
    supabase,
    user,

    studioId:
      membership.studio_id as string,

    role:
      membership.role as string,
  };
}
