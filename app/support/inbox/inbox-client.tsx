"use client";

import { useState } from "react";

export type SupportInboxItem = {
  id: string;
  kind: "ticket" | "feedback";
  category: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  contact_email: string;
  created_at: string;
};

export function InboxClient({ initialItems }: { initialItems: SupportInboxItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function setStatus(id: string, status: SupportInboxItem["status"]) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/support/${encodeURIComponent(id)}`, {
        method: "PATCH", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Update failed.");
      setItems(current => current.map(item => item.id === id ? { ...item, status } : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update request.");
    } finally { setBusyId(""); }
  }

  return (
    <div className="space-y-7">
      <div><p className="eyebrow">Founder only</p><h1 className="mt-3 text-4xl font-bold">Support inbox</h1><p className="mt-3 text-[var(--text-secondary)]">Latest 100 requests. Reply to customers by email for now; Rovei does not yet send automated replies.</p></div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!items.length && <p className="rounded-2xl bg-white p-7">No support requests yet.</p>}
      {items.map(item => (
        <article key={item.id} className="rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="eyebrow">{item.kind} · {item.category} · {item.status}</p><h2 className="mt-2 text-xl font-bold">{item.subject}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{item.contact_email} · {new Date(item.created_at).toLocaleString()}</p></div>
            <button type="button" disabled={busyId === item.id} onClick={() => void setStatus(item.id, item.status === "open" ? "resolved" : "open")} className="rounded-full border border-[var(--wine)] px-5 py-2 text-sm font-bold text-[var(--wine)] disabled:opacity-50">{item.status === "open" ? "Mark resolved" : "Reopen"}</button>
          </div>
          <p className="mt-5 whitespace-pre-wrap break-words leading-7">{item.message}</p>
          <p className="mt-4 text-xs text-[var(--text-secondary)]">Reference: {item.id.slice(0, 8).toUpperCase()}</p>
        </article>
      ))}
    </div>
  );
}
