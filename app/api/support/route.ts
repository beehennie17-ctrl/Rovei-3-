import { NextResponse } from "next/server";
import { supportRequestSchema } from "@/lib/support/support-core";
import { requireAuthenticatedUser } from "@/lib/backend/studio-context";
import { backendErrorResponse, BackendError, requireSameOrigin } from "@/lib/backend/errors";

export async function POST(request: Request) {
  try {
    const codespace = process.env.CODESPACE_NAME;
    const domain =
      process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
      || "app.github.dev";

    const expectedOrigin = codespace
      ? `https://${codespace}-3100.${domain}`
      : null;

    const origin = request.headers.get("origin");
    const expectedHost = expectedOrigin ? new URL(expectedOrigin).host : null;
    const trustedCodespacesForwarding =
      process.env.NODE_ENV === "development" &&
      expectedHost !== null &&
      request.headers.get("x-forwarded-host") === expectedHost &&
      request.headers.get("x-forwarded-proto") === "https";

    const trustedDevRequest =
      trustedCodespacesForwarding &&
      request.headers.get("sec-fetch-site") === "same-origin";
    const trustedLocalForwardedRequest =
      trustedDevRequest &&
      origin === "https://localhost:3100" &&
      request.headers.get("host") === "localhost:3100" &&
      new URL(request.url).origin === "https://0.0.0.0:3100";

    if (
      !trustedDevRequest ||
      (origin !== expectedOrigin && !trustedLocalForwardedRequest)
    ) {
      requireSameOrigin(request);
    }
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      throw new BackendError(415, "unsupported_media_type", "Send JSON data.");
    }
    const text = await request.text();
    if (text.length > 7000) throw new BackendError(413, "too_large", "The request is too long.");
    let input: unknown;
    try { input = JSON.parse(text); } catch { throw new BackendError(400, "invalid_json", "Invalid request data."); }
    const parsed = supportRequestSchema.safeParse(input);
    if (!parsed.success) throw new BackendError(400, "invalid_support_request", "Add a subject and a detailed message.");
    const { supabase, user } = await requireAuthenticatedUser();
    if (!user.email) throw new BackendError(400, "email_required", "An email address is required for support.");
    const { count, error: countError } = await supabase
      .from("support_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if (countError) throw new BackendError(503, "support_unavailable", "Support is not configured yet. Please try again later.");
    if ((count ?? 0) >= 5) throw new BackendError(429, "support_rate_limit", "Please wait before submitting another request.");
    const { data: membership, error: memberError } = await supabase
      .from("studio_members").select("studio_id").eq("user_id", user.id)
      .order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (memberError) throw new BackendError(500, "studio_lookup_failed", "Unable to identify your Studio.");
    const { data, error } = await supabase.from("support_requests").insert({
      ...parsed.data,
      user_id: user.id,
      contact_email: user.email,
      studio_id: membership?.studio_id ?? null,
    }).select("id, created_at, status").single();
    if (error || !data) throw new BackendError(503, "support_unavailable", "We could not save the request. Please try again later.");
    return NextResponse.json({ id: data.id, createdAt: data.created_at, status: data.status }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return backendErrorResponse(error); }
}
