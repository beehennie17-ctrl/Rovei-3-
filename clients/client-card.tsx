import type { CSSProperties, ReactNode } from "react";
import { Check, ChevronRight, Images, MessageSquareText } from "lucide-react";
import { clientThemes } from "@/lib/themes";
import type { ClientStatus, ClientTheme, ThemeName } from "@/types";

export type ClientCardRow = {
  id: string;
  label: string;
  value: string;
  icon?: ReactNode;
};

export type ClientCardProps = {
  theme?: ThemeName;
  themeOverride?: ClientTheme;
  clientName: string;
  clientType: string;
  service: string;
  status: ClientStatus;
  consultation?: string;
  consent?: string;
  inspirationPhotos?: string;
  clientNotes?: string;
  rows?: ClientCardRow[];
  footerLabel?: string;
  footerInteractive?: boolean;
  onFooterAction?: () => void;
  className?: string;
};

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 border-b border-black/[0.055] py-3.5 last:border-b-0"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-black/[0.035]">{icon}</span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-55">{label}</p><p className="mt-0.5 text-sm font-semibold">{value}</p></div></div>;
}

export function ClientCard({ theme = "wine", themeOverride, clientName, clientType, service, status, consultation = "Complete", consent = "Complete", inspirationPhotos = "3 photos", clientNotes = "5 notes", rows, footerLabel = "Ready for appointment", footerInteractive = true, onFooterAction, className = "" }: ClientCardProps) {
  const t = themeOverride ?? clientThemes[theme];
  const displayRows: ClientCardRow[] = rows ?? [
    { id: "consultation", label: "Consultation", value: consultation, icon: <Check size={15} /> },
    { id: "consent", label: "Consent", value: consent, icon: <Check size={15} /> },
    { id: "inspiration-photos", label: "Inspiration photos", value: inspirationPhotos, icon: <Images size={15} /> },
    { id: "client-notes", label: "Client notes", value: clientNotes, icon: <MessageSquareText size={15} /> },
  ];

  return <article className={`mx-auto w-full max-w-[390px] overflow-hidden rounded-b-[32px] rounded-t-[48%_88px] border shadow-[var(--shadow-soft)] ${className}`} style={{ borderColor: t.border, background: t.surface, color: t.text }}>
    <div className="shimmer-micro texture-cosmetic relative px-7 pb-7 pt-11" style={{ backgroundColor: t.primary, color: t.onPrimary, "--client-shimmer": t.shimmer } as CSSProperties}>
      <div className="flex items-start justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Client card</p><h3 className="editorial-accent text-[2rem] leading-none">{clientName}</h3></div><span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] backdrop-blur-sm">{clientType}</span></div>
      <div className="mt-6 flex items-center justify-between gap-4"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold" style={themeOverride ? { backgroundColor: t.surface, color: t.text } : { color: t.primary }}>{service}</span><span className="text-[11px] font-bold uppercase tracking-[0.13em] opacity-90">{status === "ready" ? "Ready" : status}</span></div>
    </div>
    <div className="px-6 pb-6 pt-5">
      {displayRows.map((row) => <InfoRow key={row.id} icon={row.icon ?? <Check size={15} />} label={row.label} value={row.value} />)}
      {footerInteractive && onFooterAction ? (
        <button type="button" onClick={onFooterAction} className="focus-ring motion-soft mt-5 flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-bold hover:translate-x-0.5" style={{ background: t.primary, color: t.onPrimary }}><span>{footerLabel}</span><ChevronRight size={17} aria-hidden /></button>
      ) : (
        <div className="mt-5 w-full rounded-2xl px-4 py-3.5 text-left text-sm font-bold" style={{ background: t.primary, color: t.onPrimary }}><span>{footerLabel}</span></div>
      )}
    </div>
  </article>;
}
