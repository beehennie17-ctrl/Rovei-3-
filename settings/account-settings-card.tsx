import { UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export function AccountSettingsCard() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Avatar initials="MR" />
        <div>
          <p className="font-bold tracking-[-0.02em]">Mia Rhodes</p>
          <p className="caption mt-1">Studio owner</p>
        </div>
        <span className="ml-auto grid size-9 place-items-center rounded-full bg-[var(--wine-soft)] text-[var(--wine)]" aria-hidden="true"><UserRound size={17} /></span>
      </div>
      <p className="body-text mt-5">Account editing will connect to your authenticated Rovei profile when the backend is enabled.</p>
    </Card>
  );
}
