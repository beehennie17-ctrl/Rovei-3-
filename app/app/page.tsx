import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NextClientCard } from "@/components/dashboard/next-client-card";
import { TodayClients } from "@/components/dashboard/today-clients";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { RecentClients } from "@/components/dashboard/recent-clients";
import {
  attentionAppointments,
  nextAppointment,
  recentClientMemories,
  todayAppointments,
} from "@/lib/dashboard-demo-data";

export default function DashboardPage() {
  return (
    <div className="space-y-10 lg:space-y-12">
      <DashboardHeader />
      <NextClientCard appointment={nextAppointment} />
      <TodayClients appointments={todayAppointments} />
      <div className="grid gap-8 xl:grid-cols-[minmax(320px,.72fr)_minmax(0,1.05fr)] xl:items-start">
        <NeedsAttention appointments={attentionAppointments} />
        <RecentClients clients={recentClientMemories} />
      </div>
    </div>
  );
}
