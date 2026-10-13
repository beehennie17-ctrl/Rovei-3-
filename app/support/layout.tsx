export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import "./support.css";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getStudioSubscriptionAccess } from "@/lib/backend/subscription-access";
import { getSupportReturnLink } from "@/lib/support/navigation";

export default async function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let authenticated = false;
  let subscriptionActive = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        authenticated = true;

        const { data: membership, error } = await supabase
          .from("studio_members")
          .select("studio_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!error && membership?.studio_id) {
          const access = await getStudioSubscriptionAccess(
            supabase,
            membership.studio_id,
          );

          subscriptionActive = !access.error && access.allowed;
        }
      }
    } catch (error) {
      console.error("Support return navigation unavailable:", error);
    }
  }

  const previewReturn =
    process.env.NODE_ENV === "development" &&
    (await cookies()).get("rovei_preview_support_return")?.value === "1";

  const back = previewReturn
    ? { href: "/dev-studio-return", label: "Back to Studio →" }
    : getSupportReturnLink(authenticated, subscriptionActive);

  return (
    <div className="rovei-support-shell min-h-screen px-5 py-6 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="care-site-header flex flex-wrap items-center justify-between gap-4 pb-6">
          <Link href="/" className="text-3xl font-black tracking-[-0.06em] text-[var(--wine)]">
            Rovei.
          </Link>
          <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold text-[var(--text-secondary)]" aria-label="Support navigation">
            <Link href="/support">Help centre</Link>
            <Link href="/support/new?kind=ticket">Contact support</Link>
            <Link href="/support/new?kind=feedback">Feedback</Link>
            <a href={back.href}>{back.label}</a>
          </nav>
        </header>
        <main className="py-5 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
