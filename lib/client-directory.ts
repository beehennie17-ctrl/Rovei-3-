import type { ClientDirectoryRecord, ClientStatusFilter } from "@/types/clients";

export type ClientDirectoryFilters = {
  search: string;
  status: ClientStatusFilter;
};

export function matchesClientSearch(client: ClientDirectoryRecord, search: string) {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return true;

  return [client.name, client.primaryService].some((value) =>
    value.toLocaleLowerCase().includes(query),
  );
}

export function filterClientDirectory(
  clients: ClientDirectoryRecord[],
  { search, status }: ClientDirectoryFilters,
) {
  return clients.filter((client) => {
    const matchesStatus = status === "all" || client.status === status;
    return matchesStatus && matchesClientSearch(client, search);
  });
}

export function formatClientResultCount(count: number, search: string, status: ClientStatusFilter) {
  const noun = count === 1 ? "client" : "clients";
  if (search.trim()) return `${count} ${noun} found`;
  if (status !== "all") return `${count} ${status} ${noun}`;
  return `${count} ${noun}`;
}
