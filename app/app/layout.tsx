import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AuthenticatedLayout() {
  if (isSupabaseConfigured()) {
    await requireUser();
  }

  redirect("/");
}
