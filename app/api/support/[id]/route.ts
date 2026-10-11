import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedUser } from "@/lib/backend/studio-context";
import { backendErrorResponse, BackendError, requireSameOrigin } from "@/lib/backend/errors";
import { isSupportAdmin } from "@/lib/support/support-core";

const updateSchema = z.object({ status: z.enum(["open", "resolved"]) }).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const { user } = await requireAuthenticatedUser();
    if (!isSupportAdmin(user.id)) throw new BackendError(403, "forbidden", "Not authorized.");
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new BackendError(400, "invalid_id", "Invalid ticket ID.");
    const raw = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) throw new BackendError(400, "invalid_status", "Choose open or resolved.");
    const admin = createAdminClient();
    const { data, error } = await admin.from("support_requests")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", id).select("id,status").maybeSingle();
    if (error) throw new BackendError(500, "support_update_failed", "Could not update this request.");
    if (!data) throw new BackendError(404, "ticket_not_found", "Request not found.");
    return NextResponse.json({ id: data.id, status: data.status }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return backendErrorResponse(error); }
}
