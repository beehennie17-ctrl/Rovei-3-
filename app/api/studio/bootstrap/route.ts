import { NextResponse } from "next/server";

import {
  backendErrorResponse,
  readJsonBody,
} from "@/lib/backend/errors";
import { bootstrapStudio } from "@/lib/backend/studio-bootstrap";
import { requireAuthenticatedUser } from "@/lib/backend/studio-context";

export async function POST(request: Request) {
  try {
    const requestBody = request.body
      ? await readJsonBody(request)
      : null;
    const {
      supabase,
      user,
    } = await requireAuthenticatedUser();

    const userMetadata = user.user_metadata as Record<string, unknown>;
    const settings = requestBody ?? userMetadata.rovei_studio_bootstrap;
    const { studioId, alreadyExists } = await bootstrapStudio(
      supabase,
      settings,
    );

    return NextResponse.json(
      {
        studioId,
        alreadyExists,
      },
      { status: alreadyExists ? 200 : 201 },
    );
  } catch (error) {
    return backendErrorResponse(error);
  }
}
