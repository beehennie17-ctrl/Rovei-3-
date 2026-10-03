import { ClientProfile } from "@/components/clients/profile/client-profile";
import { ClientProfileNotFound } from "@/components/clients/profile/client-profile-not-found";
import { buildClientProfileModel } from "@/lib/client-profile";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = buildClientProfileModel(id);
  return client ? <ClientProfile client={client} /> : <ClientProfileNotFound />;
}
