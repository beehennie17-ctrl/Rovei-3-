import { NextResponse } from "next/server";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";
import { studioSettingsSchema } from "@/lib/backend/schemas";
import { requireAuthenticatedUser } from "@/lib/backend/studio-context";
import { getServiceCategory } from "@/lib/service-categories";
import { resolveClientTheme } from "@/lib/theme-resolver";

export async function POST(request: Request) {
  try {
    const body = studioSettingsSchema.parse(
      await request.json(),
    );

    const {
      supabase,
      user,
    } = await requireAuthenticatedUser();

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("studio_members")
      .select("studio_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw new BackendError(
        500,
        "studio_lookup_failed",
        "Unable to check your Studio.",
      );
    }

    if (existing) {
      return NextResponse.json({
        studioId: existing.studio_id,
        alreadyExists: true,
      });
    }

    const theme = resolveClientTheme(
      body.theme,
      body.customPrimary,
    );

    const {
      data: studio,
      error: studioError,
    } = await supabase
      .from("studios")
      .insert({
        owner_user_id: user.id,
        name: body.studioName,
        timezone: body.timezone,
      })
      .select("id")
      .single();

    if (studioError || !studio) {
      throw new BackendError(
        500,
        "studio_create_failed",
        "Unable to create your Studio.",
      );
    }

    const studioId = studio.id as string;

    const {
      error: settingsError,
    } = await supabase
      .from("studio_settings")
      .insert({
        studio_id: studioId,
        primary_colour: theme.primary,
        theme_name: body.theme,
        theme_config: {
          customPrimary: body.customPrimary,
        },
        experience_modules:
          body.experienceSelections,
        availability: {},
      });

    if (settingsError) {
      await supabase
        .from("studios")
        .delete()
        .eq("id", studioId);

      throw new BackendError(
        500,
        "studio_setup_failed",
        "Your Studio could not be fully created.",
      );
    }

    const serviceRows = body.services.map(
      (categoryId, index) => ({
        studio_id: studioId,
        name:
          getServiceCategory(categoryId)?.name ??
          categoryId,
        category: categoryId,
        active: true,
        sort_order: index,
      }),
    );

    if (serviceRows.length > 0) {
      const {
        error: servicesError,
      } = await supabase
        .from("services")
        .insert(serviceRows);

      if (servicesError) {
        await supabase
          .from("studios")
          .delete()
          .eq("id", studioId);

        throw new BackendError(
          500,
          "studio_setup_failed",
          "Your Studio could not be fully created.",
        );
      }
    }

    return NextResponse.json(
      {
        studioId,
        alreadyExists: false,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
