"use client";

import { useEffect, useMemo, useState } from "react";
import { scheduleDemoAppointments, SCHEDULE_DEMO_TODAY } from "@/lib/schedule-demo-data";
import {
  addScheduleDays,
  applyScheduleOverrides,
  formatScheduleDay,
  formatScheduleWeekRange,
  getAppointmentsForDate,
  getAppointmentsForWeek,
  getMondayStart,
} from "@/lib/schedule";
import {
  markScheduleAppointmentCancelled,
  readScheduleStatusOverrides,
  restoreScheduleAppointment,
} from "@/lib/schedule-status-prototype";
import type { ScheduleAppointmentView, ScheduleStatusOverride } from "@/types/schedule";
import { ScheduleHeader } from "./schedule-header";
import { ScheduleViewToggle, type ScheduleView } from "./schedule-view-toggle";
import { ScheduleDateNavigation } from "./schedule-date-navigation";
import { ScheduleReadinessSummary } from "./schedule-readiness-summary";
import { TodaySchedule } from "./today-schedule";
import { WeekSchedule } from "./week-schedule";
import { CancelAppointmentDialog } from "./cancel-appointment-dialog";

export function SchedulePage() {
  const [view, setView] = useState<ScheduleView>("today");
  const [selectedDate, setSelectedDate] = useState(SCHEDULE_DEMO_TODAY);
  const [overrides, setOverrides] = useState<ScheduleStatusOverride[]>([]);
  const [cancelTarget, setCancelTarget] = useState<{ appointment: ScheduleAppointmentView; trigger: HTMLButtonElement } | null>(null);

  useEffect(() => {
    setOverrides(readScheduleStatusOverrides().overrides);
  }, []);

  const todayBase = useMemo(() => getAppointmentsForDate(scheduleDemoAppointments, selectedDate), [selectedDate]);
  const weekBase = useMemo(() => getAppointmentsForWeek(scheduleDemoAppointments, selectedDate), [selectedDate]);
  const todayAppointments = useMemo(() => applyScheduleOverrides(todayBase, overrides), [todayBase, overrides]);
  const weekAppointments = useMemo(() => applyScheduleOverrides(weekBase, overrides), [weekBase, overrides]);
  const dayLabel = formatScheduleDay(selectedDate);
  const isDemoPeriod = view === "today"
    ? selectedDate === SCHEDULE_DEMO_TODAY
    : getMondayStart(selectedDate) === getMondayStart(SCHEDULE_DEMO_TODAY);

  const changePeriod = (direction: -1 | 1) => {
    setSelectedDate((current) => addScheduleDays(current, direction * (view === "today" ? 1 : 7)));
  };

  const requestCancel = (appointment: ScheduleAppointmentView, trigger: HTMLButtonElement) => {
    setCancelTarget({ appointment, trigger });
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    const next = markScheduleAppointmentCancelled(cancelTarget.appointment.id);
    if (next) setOverrides(next.overrides);
    setCancelTarget(null);
  };

  const restore = (appointment: ScheduleAppointmentView) => {
    const next = restoreScheduleAppointment(appointment.id);
    if (next) setOverrides(next.overrides);
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      <ScheduleHeader />

      <section className="space-y-5" aria-label="Schedule controls">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ScheduleViewToggle view={view} onChange={setView} />
          <p className="caption max-w-sm sm:text-right"><span className="font-bold text-[var(--text-primary)]">Prototype schedule</span> · Appointment status changes currently stay in this browser session.</p>
        </div>

        <ScheduleDateNavigation
          view={view}
          periodLabel={view === "today" ? `${dayLabel.weekday} · ${dayLabel.dateLabel}` : formatScheduleWeekRange(selectedDate)}
          isDemoPeriod={isDemoPeriod}
          onPrevious={() => changePeriod(-1)}
          onNext={() => changePeriod(1)}
          onToday={() => setSelectedDate(SCHEDULE_DEMO_TODAY)}
        />
      </section>

      {view === "today" ? (
        <section id="schedule-today-panel" role="tabpanel" aria-labelledby="schedule-today-tab" className="space-y-5">
          <div>
            <p className="eyebrow mb-2">{dayLabel.weekday}</p>
            <h2 className="section-title">{dayLabel.dateLabel}</h2>
            <div className="mt-2"><ScheduleReadinessSummary appointments={todayAppointments} /></div>
          </div>
          <TodaySchedule appointments={todayAppointments} onRequestCancel={requestCancel} onRestore={restore} />
        </section>
      ) : (
        <section id="schedule-week-panel" role="tabpanel" aria-labelledby="schedule-week-tab" className="space-y-5">
          <div>
            <p className="eyebrow mb-2">This week</p>
            <h2 className="section-title">{formatScheduleWeekRange(selectedDate)}</h2>
            <div className="mt-2"><ScheduleReadinessSummary appointments={weekAppointments} week /></div>
          </div>
          <WeekSchedule referenceDate={selectedDate} appointments={weekAppointments} onRequestCancel={requestCancel} onRestore={restore} />
        </section>
      )}

      <CancelAppointmentDialog
        appointment={cancelTarget?.appointment ?? null}
        returnFocusTo={cancelTarget?.trigger ?? null}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
