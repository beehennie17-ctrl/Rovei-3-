import {
  NextResponse,
} from "next/server";

import {
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export async function GET() {
  const configured =
    isSupabaseConfigured();

  return NextResponse.json({
    ok: true,

    backend:
      configured
        ? "supabase"
        : "prototype",

    configured,
  });
}
