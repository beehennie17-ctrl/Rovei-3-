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

export async function GET() {
  try {
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
      .eq("studio_id", studioId)
      .eq("active", true)
      .order(
        "updated_at",
        {
          ascending: false,
        },
      );

    if (error) {
      throw new BackendError(
        500,
        "beauty_pack_load_failed",
        "Unable to load Beauty Packs.",
      );
    }

    const packs = (
      data ?? []
    ).map((pack) => ({
      id: pack.id,

      name: pack.name,

      service:
        pack.service_category,

      modules: [
        ...(
          pack.beauty_pack_modules ??
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
        pack.created_at,

      updatedAt:
        pack.updated_at,
    }));

    return NextResponse.json({
      packs,
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
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
      error: packError,
    } = await supabase
      .from("beauty_packs")
      .insert({
        studio_id: studioId,

        name: body.name,

        service_category:
          body.service,

        active: true,
      })
      .select(
        "id, name, service_category, created_at, updated_at",
      )
      .single();

    if (packError || !pack) {
      throw new BackendError(
        500,
        "beauty_pack_create_failed",
        "Unable to create this Beauty Pack.",
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
              pack.id,

            module_type:
              moduleType,

            sort_order:
              index,

            config: {},
          }),
        ),
      );

    if (moduleError) {
      await supabase
        .from("beauty_packs")
        .delete()
        .eq("id", pack.id)
        .eq(
          "studio_id",
          studioId,
        );

      throw new BackendError(
        500,
        "beauty_pack_modules_failed",
        "Unable to create this Beauty Pack.",
      );
    }

    return NextResponse.json(
      {
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
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
