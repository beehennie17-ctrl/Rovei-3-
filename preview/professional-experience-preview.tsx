import { Check, MessageSquareText } from "lucide-react";
import { ClientCard, type ClientCardRow } from "@/components/clients/client-card";
import type { PersonalPreviewModel } from "@/lib/preview-model";

export function ProfessionalExperiencePreview({ model }: { model: PersonalPreviewModel }) {
  const rows: ClientCardRow[] = [
    ...model.clientCardRows.map((row) => ({
      ...row,
      icon: <Check size={15} aria-hidden="true" />,
    })),
    {
      id: "client-notes",
      label: "Client notes",
      value: "Ready for your notes",
      icon: <MessageSquareText size={15} aria-hidden="true" />,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--sidebar-surface)] p-4 shadow-[var(--shadow-card)] sm:p-6 lg:p-8">
        <div className="mb-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--wine)]">Today</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-lg font-bold tracking-[-0.025em] text-[var(--text-primary)]">Emily Carter</h3>
                <span className="text-sm font-semibold text-[var(--text-secondary)]">2:00 PM</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{model.serviceLabel} · Client experience completed</p>
            </div>
            <span className="rounded-full bg-[var(--wine-soft)] px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--wine)]">Ready</span>
          </div>
        </div>

        <ClientCard
          theme={model.themeName}
          themeOverride={model.theme}
          clientName="Emily Carter"
          clientType="New client"
          service={model.serviceLabel}
          status="ready"
          rows={rows}
          footerInteractive={false}
        />

        <p className="mx-auto mt-5 max-w-[390px] text-center text-xs leading-5 text-[var(--text-secondary)]">
          Preview data only. No client record has been created.
        </p>
      </div>
    </div>
  );
}
