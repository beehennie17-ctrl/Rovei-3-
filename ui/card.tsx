import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white shadow-[var(--shadow-card)] ${className}`} {...props} />;
}
