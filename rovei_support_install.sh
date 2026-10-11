#!/usr/bin/env bash
set -Eeuo pipefail
cd /workspaces/Rovei-3-
LOCKED="88b01f9ee31753f54331ddd15bd12c666714bae9"
[ "$(git branch --show-current)" = "frontend/exact-locked-shell" ] || { echo 'STOP: wrong branch'; exit 1; }
[ "$(git hash-object reference/Rovei_APPROVED_FINAL_FRONTEND.html)" = "$LOCKED" ] || { echo 'STOP: locked frontend has changed'; exit 1; }
if ! git merge-base --is-ancestor 8051592 HEAD; then
  echo 'STOP: latest reviewed auth commit is not in this branch.'
  exit 1
fi
if [ -n "$(git diff --cached --name-only)" ]; then
  echo 'STOP: unrelated staged changes found. Commit or unstage them first.'
  exit 1
fi
TARGETS=(
  public/rovei-backend-bridge.js
  lib/support/support-core.ts
  app/support/layout.tsx
  app/support/page.tsx
  app/support/new/page.tsx
  app/support/new/support-form.tsx
  app/support/inbox/page.tsx
  app/support/inbox/inbox-client.tsx
  app/api/support/route.ts
  'app/api/support/[id]/route.ts'
  supabase/migrations/202610120001_support_requests.sql
  tests/support.test.mjs
  .env.example
)
if [ -n "$(git status --porcelain -- "${TARGETS[@]}")" ]; then
  echo 'STOP: a target file has local changes. Nothing was overwritten.'
  exit 1
fi
for file in "${TARGETS[@]:1:${#TARGETS[@]}-2}"; do
  if [ -e "$file" ]; then
    echo "STOP: file already exists: $file"
    exit 1
  fi
done
mkdir -p lib/support app/support/new app/support/inbox app/api/support/'[id]' supabase/migrations tests

cat > lib/support/support-core.ts <<'EOF'
import { z } from "zod";

export const supportRequestSchema = z.object({
  kind: z.enum(["ticket", "feedback"]),
  category: z.enum(["account", "billing", "studio", "clients", "technical", "other"]),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(15).max(4000),
}).strict();

export type SupportKind = z.infer<typeof supportRequestSchema>["kind"];

export function isSupportAdmin(userId: string | null | undefined, ids = process.env.ROVEI_SUPPORT_ADMIN_USER_IDS) {
  if (!userId || !ids) return false;
  return ids.split(",").some(id => id.trim() === userId);
}
EOF

cat > app/support/layout.tsx <<'EOF'
import Link from "next/link";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)] px-5 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-soft)] pb-6">
          <Link href="/" className="text-3xl font-black tracking-[-0.06em] text-[var(--wine)]">Rovei.</Link>
          <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold text-[var(--text-secondary)]" aria-label="Support navigation">
            <Link href="/support">Help centre</Link>
            <Link href="/support/new?kind=ticket">Contact support</Link>
            <Link href="/support/new?kind=feedback">Feedback</Link>
            <Link href="/">Back to Studio →</Link>
          </nav>
        </header>
        <main className="py-10 sm:py-14">{children}</main>
      </div>
    </div>
  );
}
EOF

cat > app/support/page.tsx <<'EOF'
"use client";

import Link from "next/link";
import { useState } from "react";

const questions = [
  { title: "How do I set up my Studio?", answer: "Choose your services, colour theme and client-experience modules during onboarding. You can return to your Studio settings after your subscription is active." },
  { title: "What are Beauty Packs?", answer: "Beauty Packs are reusable client-experience templates. Choose the consultation, preferences, inspiration, consent, preparation and photo steps that are relevant to a service." },
  { title: "How do I send a client a link?", answer: "From a client's appointment or experience, create a secure client link and share it directly. Clients can open their link without creating a Rovei account." },
  { title: "Can clients upload photos?", answer: "Client-experience links support photo submissions where that step is enabled. Ask clients to upload only photos relevant to their appointment." },
  { title: "How do I check appointment readiness?", answer: "Use your schedule and client-experience status to see which clients are waiting, ready or complete." },
  { title: "What happens after confirming my email?", answer: "After confirmation Rovei signs you in and restores your Studio. If payment has not been completed, you should see the activation page. You can sign in later to resume." },
  { title: "I cannot pay or access my dashboard", answer: "Check that you are signed in with the account used for onboarding. If your subscription is not showing correctly, contact support. Never send card numbers, passwords or verification links in a ticket." },
  { title: "How do I report a bug or suggest an improvement?", answer: "Use Send feedback for suggestions and minor bugs. Choose Contact support if you need help with your account or an urgent issue." },
];

export default function HelpCentre() {
  const [search, setSearch] = useState("");
  const matches = questions.filter(item => `${item.title} ${item.answer}`.toLowerCase().includes(search.toLowerCase().trim()));
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="eyebrow">Rovei support</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">How can we <span className="editorial-accent text-[var(--wine)]">help?</span></h1>
        <p className="mt-4 text-[var(--text-secondary)]">Find setup guides and quick answers, or send us a request.</p>
      </div>
      <label className="block max-w-2xl">
        <span className="mb-2 block text-sm font-semibold">Search help articles</span>
        <input aria-label="Search help articles" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Try “client link” or “billing”" className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-5 py-4 outline-none focus:border-[var(--wine)]" />
      </label>
      <div className="grid gap-4">
        {matches.map(item => (
          <details key={item.title} className="group rounded-[1.4rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <summary className="cursor-pointer font-bold text-[var(--text-primary)]">{item.title}</summary>
            <p className="mt-4 max-w-3xl leading-7 text-[var(--text-secondary)]">{item.answer}</p>
          </details>
        ))}
        {!matches.length && <p role="status">No matching help articles. You can send a support request below.</p>}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded-full bg-[var(--wine)] px-6 py-3 font-bold text-white" href="/support/new?kind=ticket">Contact support</Link>
        <Link className="rounded-full border border-[var(--border-soft)] bg-white px-6 py-3 font-bold" href="/support/new?kind=feedback">Send feedback</Link>
      </div>
    </div>
  );
}
EOF

cat > app/support/new/page.tsx <<'EOF'
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
EOF

cat > app/support/new/support-form.tsx <<'EOF'
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
EOF

cat > app/api/support/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { supportRequestSchema } from "@/lib/support/support-core";
import { requireAuthenticatedUser } from "@/lib/backend/studio-context";
import { backendErrorResponse, BackendError, requireSameOrigin } from "@/lib/backend/errors";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      throw new BackendError(415, "unsupported_media_type", "Send JSON data.");
    }
    const text = await request.text();
    if (text.length > 7000) throw new BackendError(413, "too_large", "The request is too long.");
    let input: unknown;
    try { input = JSON.parse(text); } catch { throw new BackendError(400, "invalid_json", "Invalid request data."); }
    const parsed = supportRequestSchema.safeParse(input);
    if (!parsed.success) throw new BackendError(400, "invalid_support_request", "Add a subject and a detailed message.");
    const { supabase, user } = await requireAuthenticatedUser();
    if (!user.email) throw new BackendError(400, "email_required", "An email address is required for support.");
    const { count, error: countError } = await supabase
      .from("support_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if (countError) throw new BackendError(503, "support_unavailable", "Support is not configured yet. Please try again later.");
    if ((count ?? 0) >= 5) throw new BackendError(429, "support_rate_limit", "Please wait before submitting another request.");
    const { data: membership, error: memberError } = await supabase
      .from("studio_members").select("studio_id").eq("user_id", user.id)
      .order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (memberError) throw new BackendError(500, "studio_lookup_failed", "Unable to identify your Studio.");
    const { data, error } = await supabase.from("support_requests").insert({
      ...parsed.data,
      user_id: user.id,
      contact_email: user.email,
      studio_id: membership?.studio_id ?? null,
    }).select("id, created_at, status").single();
    if (error || !data) throw new BackendError(503, "support_unavailable", "We could not save the request. Please try again later.");
    return NextResponse.json({ id: data.id, createdAt: data.created_at, status: data.status }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return backendErrorResponse(error); }
}
EOF

cat > app/support/inbox/page.tsx <<'EOF'
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
EOF

cat > app/support/inbox/inbox-client.tsx <<'EOF'
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
EOF

cat > 'app/api/support/[id]/route.ts' <<'EOF'
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedUser } from "@/lib/backend/studio-context";
import { backendErrorResponse, BackendError, requireSameOrigin } from "@/lib/backend/errors";
import { isSupportAdmin } from "@/lib/support/support-core";

const updateSchema = z.object({ status: z.enum(["open", "resolved"]) }).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const { user } = await requireAuthenticatedUser();
    if (!isSupportAdmin(user.id)) throw new BackendError(403, "forbidden", "Not authorized.");
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new BackendError(400, "invalid_id", "Invalid ticket ID.");
    const raw = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) throw new BackendError(400, "invalid_status", "Choose open or resolved.");
    const admin = createAdminClient();
    const { data, error } = await admin.from("support_requests")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", id).select("id,status").maybeSingle();
    if (error) throw new BackendError(500, "support_update_failed", "Could not update this request.");
    if (!data) throw new BackendError(404, "ticket_not_found", "Request not found.");
    return NextResponse.json({ id: data.id, status: data.status }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return backendErrorResponse(error); }
}
EOF

cat > supabase/migrations/202610120001_support_requests.sql <<'EOF'
begin;

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete set null,
  contact_email text not null check (char_length(contact_email) between 3 and 254),
  kind text not null check (kind in ('ticket','feedback')),
  category text not null check (category in ('account','billing','studio','clients','technical','other')),
  subject text not null check (char_length(trim(subject)) between 3 and 120),
  message text not null check (char_length(trim(message)) between 15 and 4000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_requests_user_created_idx
on public.support_requests(user_id, created_at desc);
create index if not exists support_requests_status_created_idx
on public.support_requests(status, created_at desc);

alter table public.support_requests enable row level security;

drop policy if exists "support_requests_select_self" on public.support_requests;
create policy "support_requests_select_self" on public.support_requests
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "support_requests_insert_self" on public.support_requests;
create policy "support_requests_insert_self" on public.support_requests
for insert to authenticated with check (
  user_id = (select auth.uid())
  and contact_email = (select auth.jwt() ->> 'email')
  and status = 'open'
  and (studio_id is null or public.is_studio_member(studio_id))
);

revoke all on public.support_requests from anon, authenticated;
grant select, insert on public.support_requests to authenticated;

commit;
EOF

cat > tests/support.test.mjs <<'EOF'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { isSupportAdmin, supportRequestSchema } from "../lib/support/support-core.ts";

const payload = { kind: "ticket", category: "account", subject: "Login problem", message: "I am unable to open my account after confirming my email." };

test("support tickets and feedback require a real message and category", () => {
  assert.equal(supportRequestSchema.safeParse(payload).success, true);
  assert.equal(supportRequestSchema.safeParse({ ...payload, kind: "feedback" }).success, true);
  assert.equal(supportRequestSchema.safeParse({ ...payload, message: "too short" }).success, false);
  assert.equal(supportRequestSchema.safeParse({ ...payload, kind: "payment_override" }).success, false);
  assert.equal(supportRequestSchema.safeParse({ ...payload, user_id: "spoofed" }).success, false);
});

test("founder inbox denies access unless the user UUID is explicitly allowlisted", () => {
  const own = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const other = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  assert.equal(isSupportAdmin(own, undefined), false);
  assert.equal(isSupportAdmin(own, other), false);
  assert.equal(isSupportAdmin(own, ` ${other}, ${own} `), true);
  assert.equal(isSupportAdmin(other, own), false);
});

test("bridge wires the three original Support buttons without modifying locked HTML", () => {
  const bridge = readFileSync("public/rovei-backend-bridge.js", "utf8");
  assert.match(bridge, /data-support-action/);
  assert.match(bridge, /\/support\/new\?kind=feedback/);
  assert.match(bridge, /\/support\/new\?kind=ticket/);
  assert.match(bridge, /\/support/);
});
EOF

python3 <<'PY'
from pathlib import Path
bridge = Path('public/rovei-backend-bridge.js')
s = bridge.read_text()
needle = '  void (async () => {\n'
if s.count(needle) != 1 or 'ROVEI_SUPPORT_LINKS_V1' in s:
    raise SystemExit('STOP: backend bridge structure changed; inspect manually.')
injection = '''  // ROVEI_SUPPORT_LINKS_V1 — capture before locked preview toast handlers.
  document.addEventListener("click", (event) => {
    const actionButton = event.target instanceof Element
      ? event.target.closest("[data-support-action]")
      : null;
    if (!actionButton) return;
    const destinations = {
      help: "/support",
      contact: "/support/new?kind=ticket",
      feedback: "/support/new?kind=feedback",
    };
    const destination = destinations[actionButton.getAttribute("data-support-action")];
    if (!destination) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.assign(destination);
  }, true);

  // Hide prototype-only note only on the now-connected Support tab.
  function hideConnectedSupportPreviewNote() {
    const supportButton = document.querySelector('[data-settings-tab="support"].active');
    const note = supportButton ? document.querySelector('.settings-panel .settings-support-note') : null;
    if (note && note.textContent?.includes('Support destinations are intentionally not connected')) {
      note.remove();
    }
  }
  const supportNoteObserver = new MutationObserver(hideConnectedSupportPreviewNote);
  supportNoteObserver.observe(document.documentElement, { childList: true, subtree: true });
  hideConnectedSupportPreviewNote();

'''
s = s.replace(needle, injection + needle, 1)
bridge.write_text(s)
env = Path('.env.example')
env.write_text(env.read_text() + '\n# Support founder inbox (comma-separated Supabase auth user UUIDs, server-only)\nROVEI_SUPPORT_ADMIN_USER_IDS=\n')
PY

node --check public/rovei-backend-bridge.js
npm run test
npm run typecheck
npm run lint
npm run build
git diff --check
[ "$(git hash-object reference/Rovei_APPROVED_FINAL_FRONTEND.html)" = "$LOCKED" ] || { echo 'STOP: approved HTML changed'; exit 1; }

git add -- "${TARGETS[@]}"
git diff --cached --check
git commit -m "feat(support): connect help tickets feedback and founder inbox"
git push origin frontend/exact-locked-shell
printf '\n✅ Support Centre code committed and pushed. Approved HTML unchanged.\n'
printf '⚠️ Tickets will save only after applying supabase/migrations/202610120001_support_requests.sql.\n'
printf '⚠️ Founder inbox requires ROVEI_SUPPORT_ADMIN_USER_IDS in .env.local (your own Supabase auth UUID).\n'
