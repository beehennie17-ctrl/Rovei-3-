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
