import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BeautyPackNotFound() {
  return (
    <Card className="mx-auto max-w-2xl p-8 text-center sm:p-10">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]"><SearchX size={20} aria-hidden="true" /></div>
      <h1 className="page-title mt-5 text-2xl">Beauty Pack not found.</h1>
      <p className="body-text mx-auto mt-3 max-w-md">This pack isn&apos;t part of your current Rovei. setup.</p>
      <Link href="/app/beauty-packs" className="focus-ring motion-soft mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--wine)] px-5 text-sm font-semibold text-white hover:bg-[var(--wine-hover)]">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Beauty Packs
      </Link>
    </Card>
  );
}
