import { NextResponse } from "next/server";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";
import { studioSettingsSchema } from "@/lib/backend/schemas";
import { requireStudioContext } from "@/lib/backend/studio-context";
import { isExperienceModuleId } from "@/lib/experience-options";
import {
  getServiceCategory,
  isServiceCategoryId,
} from "@/lib/service-categories";
import {
  isThemeName,
  resolveClientTheme,
} from "@/lib/theme-resolver";

export async function GET() {
  try {
    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const [
      studioResult,
      settingsResult,
      servicesResult,
    ] = await Promise.all([
      supabase
        .from("studios")
        .select("name, timezone")
        .eq("id", studioId)
        .single(),

      supabase
        .from("studio_settings")
        .select(
          "primary_colour, theme_name, theme_config, experience_modules",
        )
        .eq("studio_id", studioId)
        .maybeSingle(),

      supabase
        .from("services")
        .select("category, active, sort_order")
        .eq("studio_id", studioId)
        .eq("active", true)
        .order("sort_order"),
    ]);

    if (studioResult.error) {
      throw new BackendError(
        500,
        "studio_load_failed",
        "Unable to load your Studio.",
      );
    }

    if (settingsResult.error) {
      throw new BackendError(
        500,
        "studio_settings_load_failed",
        "Unable to load Studio settings.",
      );
    }

    if (servicesResult.error) {
      throw new BackendError(
        500,
        "studio_services_load_failed",
        "Unable to load Studio services.",
      );
    }

    const settings = settingsResult.data;

    const services = (
      servicesResult.data ?? []
    )
      .map((row) => row.category)
      .filter(isServiceCategoryId);

    const experienceSelections =
      Array.isArray(
        settings?.experience_modules,
      )
        ? settings.experience_modules.filter(
            isExperienceModuleId,
          )
        : [];

    const theme =
      isThemeName(settings?.theme_name)
        ? settings.theme_name
        : "wine";

    const themeConfig =
      settings?.theme_config &&
      typeof settings.theme_config === "object" &&
      !Array.isArray(settings.theme_config)
        ? (settings.theme_config as Record<
            string,
            unknown
          >)
        : {};

    const customPrimary =
      typeof themeConfig.customPrimary === "string"
        ? themeConfig.customPrimary
        : settings?.primary_colour ??
          "#941651";

    return NextResponse.json({
      studioName: studioResult.data.name,
      timezone: studioResult.data.timezone,
      services,
      theme,
      customPrimary,
      experienceSelections,
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = studioSettingsSchema.parse(
      await request.json(),
    );

    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const resolvedTheme =
      resolveClientTheme(
        body.theme,
        body.customPrimary,
      );

    const {
      error: studioError,
    } = await supabase
      .from("studios")
      .update({
        name: body.studioName,
        timezone: body.timezone,
      })
      .eq("id", studioId);

    if (studioError) {
      throw new BackendError(
        500,
        "studio_update_failed",
        "Unable to update your Studio.",
      );
    }

    const {
      error: settingsError,
    } = await supabase
      .from("studio_settings")
      .upsert({
        studio_id: studioId,
        primary_colour:
          resolvedTheme.primary,
        theme_name: body.theme,
        theme_config: {
          customPrimary:
            body.customPrimary,
        },
        experience_modules:
          body.experienceSelections,
      });

    if (settingsError) {
      throw new BackendError(
        500,
        "studio_settings_update_failed",
        "Unable to save Studio settings.",
      );
    }

    const {
      data: existingServices,
      error: servicesLoadError,
    } = await supabase
      .from("services")
      .select("id, category")
      .eq("studio_id", studioId);

    if (servicesLoadError) {
      throw new BackendError(
        500,
        "service_load_failed",
        "Unable to update Studio services.",
      );
    }

    const selected =
      new Set(body.services);

    for (
      const service of
      existingServices ?? []
    ) {
      if (
        !isServiceCategoryId(
          service.category,
        )
      ) {
        continue;
      }

      const {
        error,
      } = await supabase
        .from("services")
        .update({
          active:
            selected.has(
              service.category,
            ),
        })
        .eq("id", service.id)
        .eq(
          "studio_id",
          studioId,
        );

      if (error) {
        throw new BackendError(
          500,
          "service_update_failed",
          "Unable to update Studio services.",
        );
      }
    }

    const existingCategories =
      new Set(
        (
          existingServices ?? []
        )
          .map(
            (service) =>
              service.category,
          )
          .filter(
            isServiceCategoryId,
          ),
      );

    const missing =
      body.services.filter(
        (category) =>
          !existingCategories.has(
            category,
          ),
      );

    if (missing.length > 0) {
      const {
        error,
      } = await supabase
        .from("services")
        .insert(
          missing.map(
            (
              categoryId,
              index,
            ) => ({
              studio_id:
                studioId,
              name:
                getServiceCategory(
                  categoryId,
                )?.name ??
                categoryId,
              category:
                categoryId,
              active: true,
              sort_order:
                existingCategories.size +
                index,
            }),
          ),
        );

      if (error) {
        throw new BackendError(
          500,
          "service_create_failed",
          "Unable to save Studio services.",
        );
      }
    }

    return NextResponse.json({
      saved: true,
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
