import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupportForm } from "./support-form";

export default async function SupportNew({ searchParams }: {
  searchParams: Promise<{kind?: string}>;
}) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { kind } = await searchParams;
  return <SupportForm kind={kind === "feedback" ? "feedback" : "ticket"} />;
}
