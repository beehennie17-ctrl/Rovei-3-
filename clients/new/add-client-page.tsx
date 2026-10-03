"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AddClientForm } from "@/components/clients/new/add-client-form";
import { NewClientExperienceSummary } from "@/components/clients/new/new-client-experience-summary";
import { Card } from "@/components/ui/card";
import { readOnboardingDraft } from "@/lib/onboarding-storage";
import { getRecommendedExperienceModules } from "@/lib/experience-recommendations";
import { clearClientLinkPrototype } from "@/lib/client-link-prototype";
import { readNewClientDraft, writeNewClientDraft } from "@/lib/new-client-draft";
import { resolveClientTheme } from "@/lib/theme-resolver";
import type { NewClientDraft } from "@/types/client-creation";
import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

type LiveDraft = {
  firstName: string;
  lastName: string;
  service: ServiceCategoryId | "";
  appointmentDate: string;
  appointmentTime: string;
};

const EMPTY_DRAFT: LiveDraft = {
  firstName: "",
  lastName: "",
  service: "",
  appointmentDate: "",
  appointmentTime: "",
};

export function AddClientPage() {
  const router = useRouter();
  const [initialDraft, setInitialDraft] = useState<NewClientDraft | null>(null);
  const [liveDraft, setLiveDraft] = useState<LiveDraft>(EMPTY_DRAFT);
  const [experienceSelections, setExperienceSelections] = useState<ExperienceModuleId[] | undefined>(undefined);
  const [theme, setTheme] = useState(() => resolveClientTheme("wine"));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedDraft = readNewClientDraft();
    if (savedDraft) {
      setInitialDraft(savedDraft);
      setLiveDraft(savedDraft);
    }

    const onboarding = readOnboardingDraft();
    setTheme(resolveClientTheme(onboarding.theme, onboarding.customPrimary));
    setExperienceSelections(onboarding.experienceSelections);
    setHydrated(true);
  }, []);

  const previewSelections = useMemo(() => {
    if (experienceSelections !== undefined) return experienceSelections;
    if (!liveDraft.service) return [];
    return getRecommendedExperienceModules([liveDraft.service]);
  }, [experienceSelections, liveDraft.service]);

  function handleValidSubmit(draft: NewClientDraft) {
    clearClientLinkPrototype();
    if (!writeNewClientDraft(draft)) return;
    router.push("/app/clients/new/link");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 page-enter">
      <div>
        <Link href="/app/clients" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-[var(--wine)] hover:underline">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Clients</span>
        </Link>
        <p className="eyebrow mt-8">Client experience</p>
        <h1 className="page-title mt-3">Add a <span className="editorial-accent">client.</span></h1>
        <p className="body-text mt-3 max-w-2xl">Tell Rovei. who you&apos;re seeing and when. We&apos;ll prepare the experience you send before their appointment.</p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)] lg:items-start">
        <Card className="p-6 sm:p-8">
          <p className="section-title">Client details</p>
          <p className="caption mt-1.5 mb-7">Only the essentials for this appointment.</p>
          {hydrated && <AddClientForm initialDraft={initialDraft} onDraftChange={setLiveDraft} onValidSubmit={handleValidSubmit} />}
        </Card>

        <div className="lg:sticky lg:top-7">
          <NewClientExperienceSummary {...liveDraft} experienceSelections={previewSelections} theme={theme} />
        </div>
      </div>
    </div>
  );
}
