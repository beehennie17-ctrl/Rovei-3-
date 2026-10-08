import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  renderLockedShellDocument,
  resolveLockedShellScreen,
} from "@/lib/auth/locked-shell";
import { BackendError } from "@/lib/backend/errors";
import { bootstrapStudio } from "@/lib/backend/studio-bootstrap";
import { studioSettingsSchema } from "@/lib/backend/schemas";
import { isServiceCategoryId } from "@/lib/service-categories";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isThemeName } from "@/lib/theme-resolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getAuthenticatedShellState() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const pendingStudio = studioSettingsSchema.safeParse(
    user.user_metadata?.rovei_studio_bootstrap,
  );
  let { data: membership, error: membershipError } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new BackendError(
      500,
      "studio_lookup_failed",
      "Unable to restore your Studio.",
    );
  }

  if (!membership && pendingStudio.success) {
    await bootstrapStudio(supabase, pendingStudio.data);
    const refreshedMembership = await supabase
      .from("studio_members")
      .select("studio_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    membership = refreshedMembership.data;
    membershipError = refreshedMembership.error;

    if (membershipError) {
      throw new BackendError(
        500,
        "studio_lookup_failed",
        "Unable to restore your Studio.",
      );
    }
  }

  let studio = null;
  let settings = null;
  let services: string[] = [];
  let subscriptionStatus: string | null = null;

  if (membership?.studio_id) {
    const [
      studioResult,
      settingsResult,
      servicesResult,
      subscriptionResult,
    ] = await Promise.all([
      supabase
        .from("studios")
        .select("name, timezone")
        .eq("id", membership.studio_id)
        .single(),
      supabase
        .from("studio_settings")
        .select("primary_colour, theme_name, theme_config, experience_modules")
        .eq("studio_id", membership.studio_id)
        .maybeSingle(),
      supabase
        .from("services")
        .select("category")
        .eq("studio_id", membership.studio_id)
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("subscriptions")
        .select("status")
        .eq("studio_id", membership.studio_id)
        .maybeSingle(),
    ]);

    if (
      studioResult.error ||
      settingsResult.error ||
      servicesResult.error ||
      subscriptionResult.error
    ) {
      console.error("Unable to restore authenticated Rovei state:", {
        studio: studioResult.error,
        settings: settingsResult.error,
        services: servicesResult.error,
        subscription: subscriptionResult.error,
      });
      throw new BackendError(
        500,
        "account_restore_failed",
        "Unable to restore your Rovei account. Please try again.",
      );
    }

    studio = studioResult.data;
    settings = settingsResult.data;
    services = (servicesResult.data ?? [])
      .map((service) => service.category)
      .filter(isServiceCategoryId);
    subscriptionStatus = subscriptionResult.data?.status ?? "inactive";
  }

  const theme = isThemeName(settings?.theme_name)
    ? settings.theme_name
    : "wine";
  const themeConfig =
    settings?.theme_config &&
    typeof settings.theme_config === "object" &&
    !Array.isArray(settings.theme_config)
      ? (settings.theme_config as Record<string, unknown>)
      : {};
  const customPrimary =
    typeof themeConfig.customPrimary === "string"
      ? themeConfig.customPrimary
      : settings?.primary_colour ?? "#941651";
  const experienceSelections = studio
    ? Array.isArray(settings?.experience_modules)
      ? settings.experience_modules
      : []
    : pendingStudio.success
      ? pendingStudio.data.experienceSelections
      : [];

  return {
    studio: {
      exists: Boolean(membership),
      name: studio?.name ?? (pendingStudio.success ? pendingStudio.data.studioName : ""),
      timezone:
        studio?.timezone ??
        (pendingStudio.success ? pendingStudio.data.timezone : "UTC"),
      services: studio
        ? services
        : pendingStudio.success
          ? pendingStudio.data.services
          : [],
      theme:
        studio
          ? theme
          : pendingStudio.success
            ? pendingStudio.data.theme
            : "wine",
      customPrimary:
        studio
          ? customPrimary
          : pendingStudio.success
            ? pendingStudio.data.customPrimary
            : "#941651",
      modules: experienceSelections,
    },
    account: {
      firstName:
        typeof user.user_metadata?.first_name === "string"
          ? user.user_metadata.first_name
          : "",
      email: user.email ?? "",
      terms: true,
    },
    hasStudio: Boolean(membership),
    subscriptionStatus,
  };
}

export async function GET(request: Request) {
  const frontendPath = path.join(
    process.cwd(),
    "reference",
    "Rovei_APPROVED_FINAL_FRONTEND.html",
  );

  const lockedHtml =
    await readFile(frontendPath, "utf8");
  const url = new URL(request.url);
  const requestedScreen = url.searchParams.get("rovei");
  const authenticatedState = await getAuthenticatedShellState();
  const screen = resolveLockedShellScreen({
    authenticated: authenticatedState !== null,
    requestedScreen,
    hasStudio: authenticatedState?.hasStudio ?? false,
    subscriptionStatus:
      authenticatedState?.subscriptionStatus ?? null,
  });
  const initialState = authenticatedState
    ? {
        version: 3,
        screen,
        productTourCompleted: true,
        wizardStep: 0,
        studio: authenticatedState.studio,
        account: authenticatedState.account,
        settings: {
          subscriptionStatus:
            authenticatedState.subscriptionStatus ?? "inactive",
          availability: {
            timezone: authenticatedState.studio.timezone,
          },
        },
        billing: "monthly",
        appPage: "home",
        scheduleView: "today",
        clients: [],
        beautyPacks: [],
        visits: [],
        activeClientId: null,
        clientLinkToken: "",
        clientPortal: {
          mode: "client",
          clientId: null,
          index: -1,
          draft: {},
        },
        signupDraft: { password: "" },
      }
    : null;
  const html = renderLockedShellDocument(
    lockedHtml,
    initialState,
    screen === "welcome" && !authenticatedState
      ? "onboarding"
      : null,
  );

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type":
        "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Rovei-Frontend":
        "approved-locked",
    },
  });
}
