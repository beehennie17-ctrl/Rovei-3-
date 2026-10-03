import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/current-user";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * Until .env.local is configured, the existing frontend
   * remains previewable in Codespaces.
   *
   * Once Supabase credentials exist, /app becomes protected.
   */
  if (isSupabaseConfigured()) {
    await requireUser();
  }

  return <AppShell>{children}</AppShell>;
}
