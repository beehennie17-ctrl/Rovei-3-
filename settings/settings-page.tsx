import { AccountSettingsCard } from "@/components/settings/account-settings-card";
import { PlanSettingsCard } from "@/components/settings/plan-settings-card";
import { WorkspaceShortcuts } from "@/components/settings/workspace-shortcuts";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 page-enter">
      <header className="max-w-2xl">
        <p className="eyebrow">Account</p>
        <h1 className="page-title mt-3">Settings</h1>
        <p className="body-text mt-3">Your Rovei account, plan and workspace.</p>
      </header>

      <section className="grid gap-5 lg:grid-cols-2" aria-label="Account and plan settings">
        <AccountSettingsCard />
        <PlanSettingsCard />
      </section>

      <WorkspaceShortcuts />
    </div>
  );
}
