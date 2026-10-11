import type { SupabaseClient } from "@supabase/supabase-js";

export function hasActiveSubscription(
  status: string | null | undefined,
  currentPeriodEnd: string | null | undefined,
  now = Date.now(),
) {
  if (status !== "active" && status !== "trialing") {
    return false;
  }

  if (!currentPeriodEnd) return true;

  const endTime = Date.parse(currentPeriodEnd);
  return Number.isFinite(endTime) && endTime > now;
}

export function effectiveSubscriptionStatus(
  status: string | null | undefined,
  currentPeriodEnd: string | null | undefined,
) {
  if (!hasActiveSubscription(status, currentPeriodEnd)) {
    return "inactive";
  }

  return status === "active" ? "active" : "trialing";
}

export async function getStudioSubscriptionAccess(
  supabase: SupabaseClient,
  studioId: string,
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("studio_id", studioId)
    .maybeSingle();

  if (error) {
    return { allowed: false, error };
  }

  return {
    allowed: hasActiveSubscription(data?.status, data?.current_period_end),
    error: null,
  };
}
