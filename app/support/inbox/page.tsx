import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupportAdmin } from "@/lib/support/support-core";
import { InboxClient, type SupportInboxItem } from "./inbox-client";

export const dynamic = "force-dynamic";

export default async function SupportInbox() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isSupportAdmin(user.id)) notFound();
  const admin = createAdminClient();
  const { data, error } = await admin.from("support_requests")
    .select("id,kind,category,subject,message,status,created_at,contact_email")
    .order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error("Support inbox is unavailable. Check that the support migration was applied.");
  return <InboxClient initialItems={(data ?? []) as SupportInboxItem[]} />;
}
