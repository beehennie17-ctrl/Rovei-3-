import "server-only";

import { BackendError } from "@/lib/backend/errors";
import { requireAuthenticatedUser } from "@/lib/backend/studio-context";

export async function requireStudioBillingOwner() {
  const { supabase, user } = await requireAuthenticatedUser();
  const { data: membership, error } = await supabase
    .from("studio_members")
    .select("studio_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Unable to verify Studio billing ownership:", error);
    throw new BackendError(500, "studio_lookup_failed", "Unable to load your Studio.");
  }

  if (!membership) {
    throw new BackendError(409, "studio_not_created", "Create your Studio before subscribing.");
  }

  if (membership.role !== "owner") {
    throw new BackendError(
      403,
      "studio_owner_required",
      "Only the Studio owner can manage billing.",
    );
  }

  return {
    supabase,
    user,
    studioId: membership.studio_id,
  };
}
