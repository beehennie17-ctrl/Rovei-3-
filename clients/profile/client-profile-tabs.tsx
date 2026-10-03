"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { ClientProfileViewModel } from "@/types/client-profile";
import { ClientOverview } from "@/components/clients/profile/client-overview";
import { ClientVisits } from "@/components/clients/profile/client-visits";
import { ClientPhotos } from "@/components/clients/profile/client-photos";
import { ClientForms } from "@/components/clients/profile/client-forms";
import { ClientNotes } from "@/components/clients/profile/client-notes";

const tabs = ["Overview", "Visits", "Photos", "Forms", "Notes"] as const;
type ProfileTab = (typeof tabs)[number];

export function ClientProfileTabs({ client }: { client: ClientProfileViewModel }) {
  const [active, setActive] = useState<ProfileTab>("Overview");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectFromKeyboard(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setActive(nextTab);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section className="space-y-5">
      <div className="overflow-x-auto pb-1">
        <div role="tablist" aria-label="Client profile sections" className="inline-flex min-w-max gap-1 rounded-full border border-[var(--border-soft)] bg-white p-1">
          {tabs.map((tab, index) => {
            const selected = tab === active;
            const id = `client-tab-${tab.toLowerCase()}`;
            const panel = `client-panel-${tab.toLowerCase()}`;
            return <button
              key={tab}
              ref={(element: HTMLButtonElement | null) => { tabRefs.current[index] = element; }}
              id={id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panel}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab)}
              onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => selectFromKeyboard(event, index)}
              className={`focus-ring rounded-full px-4 py-2 text-xs font-semibold transition ${selected ? "bg-[var(--wine)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--wine-soft)]"}`}
            >{tab}</button>;
          })}
        </div>
      </div>
      {tabs.map((tab) => active === tab ? (
        <div key={tab} id={`client-panel-${tab.toLowerCase()}`} role="tabpanel" aria-labelledby={`client-tab-${tab.toLowerCase()}`} className="page-enter">
          {tab === "Overview" && <ClientOverview client={client} />}
          {tab === "Visits" && <ClientVisits client={client} />}
          {tab === "Photos" && <ClientPhotos client={client} />}
          {tab === "Forms" && <ClientForms client={client} />}
          {tab === "Notes" && <ClientNotes client={client} />}
        </div>
      ) : null)}
    </section>
  );
}
