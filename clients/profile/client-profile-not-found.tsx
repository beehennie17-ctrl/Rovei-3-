import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ClientProfileNotFound() {
  return <Card className="mx-auto max-w-2xl p-8 text-center sm:p-10">
    <p className="eyebrow">Client profile</p>
    <h1 className="page-title mt-4">Client not found.</h1>
    <p className="body-text mx-auto mt-3 max-w-lg">This client isn&apos;t part of the current Rovei. workspace.</p>
    <Link href="/app/clients" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--wine)] px-4 py-3 text-sm font-bold text-white"><ArrowLeft size={16} aria-hidden /> Back to clients</Link>
  </Card>;
}
