import { ClientExperiencePage } from "@/components/client-experience/client-experience-page";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ClientExperiencePage token={token} />;
}
