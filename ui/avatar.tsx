export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "size-8 text-[10px]" : size === "lg" ? "size-12 text-sm" : "size-10 text-xs";
  return <div aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-[var(--rose-milk)] font-bold tracking-[0.04em] text-[var(--wine)] ${sizeClass}`}>{initials}</div>;
}
