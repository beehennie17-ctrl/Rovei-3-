import type { HTMLAttributes } from "react";
import type { ClientStatus } from "@/types";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.03em] text-[var(--text-secondary)] ${className}`} {...props} />;
}

export function StatusBadge({ status }: { status: ClientStatus }) {
  const style = {
    ready: "border-[#B8C9BD] bg-[#F0F5F1] text-[var(--success)]",
    waiting: "border-[#DEC9AE] bg-[#FBF5EC] text-[var(--warning)]",
    complete: "border-[var(--blush)] bg-[var(--wine-soft)] text-[var(--wine)]",
    draft: "border-[var(--mauve)] bg-[#F5F1F4] text-[var(--text-secondary)]",
  }[status];
  return <Badge className={`uppercase ${style}`}>{status}</Badge>;
}
