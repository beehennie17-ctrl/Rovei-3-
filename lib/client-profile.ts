import { clientDirectoryDemoData } from "@/lib/client-directory-demo-data";
import { clientProfileDetails } from "@/lib/client-profile-demo-data";
import type { ClientProfileViewModel } from "@/types/client-profile";
import type { ClientStatus } from "@/types";

export function buildClientProfileModel(clientId: string): ClientProfileViewModel | null {
  const base = clientDirectoryDemoData.find((client) => client.id === clientId);
  const details = clientProfileDetails[clientId];

  if (!base || !details) return null;

  return { ...base, ...details };
}

export function getClientProfileFooterLabel(status: ClientStatus) {
  return {
    ready: "Ready for appointment",
    waiting: "Waiting on client",
    draft: "Client experience draft",
    complete: "Visit complete",
  }[status];
}
