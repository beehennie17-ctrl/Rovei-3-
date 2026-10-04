import { NextResponse } from "next/server";

import {
  backendErrorResponse,
  BackendError,
} from "@/lib/backend/errors";

import {
  beautyPackInputSchema,
} from "@/lib/backend/schemas";

import {
  requireStudioContext,
} from "@/lib/backend/studio-context";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const {
      data,
      error,
    } = await supabase
      .from("beauty_packs")
      .select(`
        id,
        name,
        service_category,
        created_at,
        updated_at,
        beauty_pack_modules (
          module_type,
          sort_order
        )
      `)
      .eq("id", id)
      .eq("studio_id", studioId)
      .maybeSingle();

    if (error) {
      throw new BackendError(
        500,
        "beauty_pack_load_failed",
        "Unable to load this Beauty Pack.",
      );
    }

    if (!data) {
      throw new BackendError(
        404,
        "beauty_pack_not_found",
        "Beauty Pack not found.",
      );
    }

    return NextResponse.json({
      pack: {
        id: data.id,

        name: data.name,

        service:
          data.service_category,

        modules: [
          ...(
            data.beauty_pack_modules ??
            []
          ),
        ]
          .sort(
            (a, b) =>
              a.sort_order -
              b.sort_order,
          )
          .map(
            (module) =>
              module.module_type,
          ),

        createdAt:
          data.created_at,

        updatedAt:
          data.updated_at,
      },
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    const body =
      beautyPackInputSchema.parse(
        await request.json(),
      );

    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const {
      data: pack,
      error: updateError,
    } = await supabase
      .from("beauty_packs")
      .update({
        name: body.name,

        service_category:
          body.service,
      })
      .eq("id", id)
      .eq("studio_id", studioId)
      .select(
        "id, name, service_category, created_at, updated_at",
      )
      .maybeSingle();

    if (updateError) {
      throw new BackendError(
        500,
        "beauty_pack_update_failed",
        "Unable to update this Beauty Pack.",
      );
    }

    if (!pack) {
      throw new BackendError(
        404,
        "beauty_pack_not_found",
        "Beauty Pack not found.",
      );
    }

    const {
      error: deleteError,
    } = await supabase
      .from(
        "beauty_pack_modules",
      )
      .delete()
      .eq(
        "beauty_pack_id",
        id,
      )
      .eq(
        "studio_id",
        studioId,
      );

    if (deleteError) {
      throw new BackendError(
        500,
        "beauty_pack_update_failed",
        "Unable to update this Beauty Pack.",
      );
    }

    const {
      error: moduleError,
    } = await supabase
      .from(
        "beauty_pack_modules",
      )
      .insert(
        body.modules.map(
          (
            moduleType,
            index,
          ) => ({
            studio_id:
              studioId,

            beauty_pack_id:
              id,

            module_type:
              moduleType,

            sort_order:
              index,

            config: {},
          }),
        ),
      );

    if (moduleError) {
      throw new BackendError(
        500,
        "beauty_pack_modules_failed",
        "Unable to save Beauty Pack modules.",
      );
    }

    return NextResponse.json({
      pack: {
        id: pack.id,

        name: pack.name,

        service:
          pack.service_category,

        modules:
          body.modules,

        createdAt:
          pack.created_at,

        updatedAt:
          pack.updated_at,
      },
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    const {
      supabase,
      studioId,
    } = await requireStudioContext();

    const {
      data,
      error,
    } = await supabase
      .from("beauty_packs")
      .delete()
      .eq("id", id)
      .eq("studio_id", studioId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new BackendError(
        500,
        "beauty_pack_delete_failed",
        "Unable to delete this Beauty Pack.",
      );
    }

    if (!data) {
      throw new BackendError(
        404,
        "beauty_pack_not_found",
        "Beauty Pack not found.",
      );
    }

    return NextResponse.json({
      deleted: true,
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
