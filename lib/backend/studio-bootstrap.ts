import type { SupabaseClient } from "@supabase/supabase-js";

import { BackendError } from "@/lib/backend/errors";
import { studioSettingsSchema } from "@/lib/backend/schemas";
import { executeBootstrapStudioRpc } from "@/lib/backend/bootstrap-rpc";
import { getServiceCategory } from "@/lib/service-categories";
import { resolveClientTheme } from "@/lib/theme-resolver";

export async function bootstrapStudio(
  supabase: SupabaseClient,
  input: unknown,
) {
  const settings = studioSettingsSchema.parse(input);

  const args = {
    p_name: settings.studioName,
    p_timezone: settings.timezone,
    p_theme: settings.theme,
    p_primary_colour: resolveClientTheme(
      settings.theme,
      settings.customPrimary,
    ).primary,
    p_custom_primary: settings.customPrimary,
    p_experience_modules: settings.experienceSelections,
    p_services: settings.services.map((category, sort_order) => ({
      name: getServiceCategory(category)?.name ?? category,
      category,
      sort_order,
    })),
  };

  try {
    return await executeBootstrapStudioRpc(
      (parameters) => supabase.rpc("bootstrap_studio", parameters),
      args,
    );
  } catch (error) {
    console.error("Studio bootstrap failed:", error);
    throw new BackendError(
      500,
      "studio_setup_failed",
      "Your Studio could not be fully created. Please try again.",
    );
  }
}
