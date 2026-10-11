"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { SupportKind } from "@/lib/support/support-core";

export function SupportForm({ kind }: { kind: SupportKind }) {
  const [category, setCategory] = useState("other");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const isFeedback = kind === "feedback";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, category, subject, message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Unable to submit your request.");
      setReference(result.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit your request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10">
      <p className="eyebrow">Rovei support</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">{isFeedback ? "Share your feedback" : "Contact support"}</h1>
      {reference ? (
        <div role="status" className="mt-7 space-y-4">
          <p className="text-lg font-semibold text-[var(--success)]">{isFeedback ? "Feedback received!" : "Support request received!"}</p>
          <p>Your reference is <strong>{reference.slice(0, 8).toUpperCase()}</strong>. Your request has been saved securely.</p>
          <p className="text-sm text-[var(--text-secondary)]">Replies are not automated yet. For urgent account concerns, check back with Rovei support.</p>
          <Link href="/support" className="inline-block font-bold text-[var(--wine)]">Back to Help Centre →</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-5">
          <p className="text-sm text-[var(--text-secondary)]">{isFeedback ? "Tell us what would improve Rovei." : "Describe what happened and we'll review your request."} Please do not include client data, passwords, card numbers or sensitive photos.</p>
          <label className="grid gap-2 text-sm font-semibold">Topic
            <select value={category} onChange={event => setCategory(event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border-soft)] bg-white px-4">
              <option value="other">Other</option>
              <option value="account">Account</option>
              <option value="billing">Plan and billing</option>
              <option value="studio">Studio setup</option>
              <option value="clients">Clients and experiences</option>
              <option value="technical">Technical issue</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">Subject
            <input required minLength={3} maxLength={120} value={subject} onChange={event => setSubject(event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border-soft)] px-4" placeholder="Brief summary" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">Details
            <textarea required minLength={15} maxLength={4000} rows={7} value={message} onChange={event => setMessage(event.target.value)} className="rounded-2xl border border-[var(--border-soft)] p-4" placeholder="Give us enough detail to understand your request" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-[var(--wine)] px-6 font-bold text-white disabled:opacity-50">{busy ? "Sending…" : isFeedback ? "Send feedback" : "Send request"}</button>
        </form>
      )}
    </section>
  );
}
