"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  SCHEDULE_DEMO_TODAY,
} from "@/lib/schedule-demo-data";

import {
  addScheduleDays,
  applyScheduleOverrides,
  formatScheduleDateOnly,
  formatScheduleDay,
  formatScheduleWeekRange,
  getAppointmentsForDate,
  getAppointmentsForWeek,
  getMondayStart,
} from "@/lib/schedule";

import {
  loadSchedule,
  setScheduleCancelled,
} from "@/lib/data/rovei-data-source";

import type {
  BackendMode,
} from "@/lib/backend/api-client";

import type {
  ScheduleAppointment,
  ScheduleAppointmentView,
  ScheduleStatusOverride,
} from "@/types/schedule";

import {
  ScheduleHeader,
} from "./schedule-header";

import {
  ScheduleViewToggle,
  type ScheduleView,
} from "./schedule-view-toggle";

import {
  ScheduleDateNavigation,
} from "./schedule-date-navigation";

import {
  ScheduleReadinessSummary,
} from "./schedule-readiness-summary";

import {
  TodaySchedule,
} from "./today-schedule";

import {
  WeekSchedule,
} from "./week-schedule";

import {
  CancelAppointmentDialog,
} from "./cancel-appointment-dialog";

export function SchedulePage() {
  const [
    view,
    setView,
  ] =
    useState<ScheduleView>(
      "today",
    );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    SCHEDULE_DEMO_TODAY,
  );

  const [
    baseDate,
    setBaseDate,
  ] = useState(
    SCHEDULE_DEMO_TODAY,
  );

  const [
    appointments,
    setAppointments,
  ] = useState<
    ScheduleAppointment[]
  >([]);

  const [
    overrides,
    setOverrides,
  ] = useState<
    ScheduleStatusOverride[]
  >([]);

  const [
    backendMode,
    setBackendMode,
  ] =
    useState<BackendMode | null>(
      null,
    );

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    cancelTarget,
    setCancelTarget,
  ] = useState<{
    appointment:
      ScheduleAppointmentView;

    trigger:
      HTMLButtonElement;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const result =
          await loadSchedule();

        if (!active) {
          return;
        }

        setBackendMode(
          result.mode,
        );

        setAppointments(
          result.data
            .appointments,
        );

        setOverrides(
          result.data
            .cancelledAppointmentIds
            .map(
              (
                appointmentId,
              ) => ({
                appointmentId,
                status:
                  "cancelled" as const,
              }),
            ),
        );

        if (
          result.mode ===
          "supabase"
        ) {
          const today =
            formatScheduleDateOnly(
              new Date(),
            );

          setSelectedDate(
            today,
          );

          setBaseDate(
            today,
          );
        }
      } catch {
        if (!active) {
          return;
        }

        setLoadError(
          "Rovei couldn’t load your schedule. Please refresh and try again.",
        );
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const todayBase =
    useMemo(
      () =>
        getAppointmentsForDate(
          appointments,
          selectedDate,
        ),
      [
        appointments,
        selectedDate,
      ],
    );

  const weekBase =
    useMemo(
      () =>
        getAppointmentsForWeek(
          appointments,
          selectedDate,
        ),
      [
        appointments,
        selectedDate,
      ],
    );

  const todayAppointments =
    useMemo(
      () =>
        applyScheduleOverrides(
          todayBase,
          overrides,
        ),
      [
        todayBase,
        overrides,
      ],
    );

  const weekAppointments =
    useMemo(
      () =>
        applyScheduleOverrides(
          weekBase,
          overrides,
        ),
      [
        weekBase,
        overrides,
      ],
    );

  const dayLabel =
    formatScheduleDay(
      selectedDate,
    );

  const isDemoPeriod =
    view === "today"
      ? selectedDate ===
        baseDate
      : getMondayStart(
          selectedDate,
        ) ===
        getMondayStart(
          baseDate,
        );

  const changePeriod = (
    direction:
      | -1
      | 1,
  ) => {
    setSelectedDate(
      (current) =>
        addScheduleDays(
          current,

          direction *
            (
              view ===
              "today"
                ? 1
                : 7
            ),
        ),
    );
  };

  const requestCancel = (
    appointment:
      ScheduleAppointmentView,

    trigger:
      HTMLButtonElement,
  ) => {
    setActionError("");

    setCancelTarget({
      appointment,
      trigger,
    });
  };

  async function confirmCancel() {
    if (!cancelTarget) {
      return;
    }

    const id =
      cancelTarget
        .appointment.id;

    try {
      const result =
        await setScheduleCancelled(
          id,
          true,
        );

      if (!result.saved) {
        throw new Error(
          "Appointment status was not saved.",
        );
      }

      setOverrides(
        (current) =>
          current.some(
            (override) =>
              override.appointmentId ===
              id,
          )
            ? current
            : [
                ...current,

                {
                  appointmentId:
                    id,

                  status:
                    "cancelled",
                },
              ],
      );
    } catch {
      setActionError(
        "Rovei couldn’t cancel this appointment. Please try again.",
      );
    } finally {
      setCancelTarget(
        null,
      );
    }
  }

  async function restore(
    appointment:
      ScheduleAppointmentView,
  ) {
    setActionError("");

    try {
      const result =
        await setScheduleCancelled(
          appointment.id,
          false,
        );

      if (!result.saved) {
        throw new Error(
          "Appointment status was not restored.",
        );
      }

      setOverrides(
        (current) =>
          current.filter(
            (override) =>
              override.appointmentId !==
              appointment.id,
          ),
      );
    } catch {
      setActionError(
        "Rovei couldn’t restore this appointment. Please try again.",
      );
    }
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <ScheduleHeader />

      <section
        className="space-y-5"
        aria-label="Schedule controls"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ScheduleViewToggle
            view={view}
            onChange={
              setView
            }
          />

          <p className="caption max-w-sm sm:text-right">
            <span className="font-bold text-[var(--text-primary)]">
              {backendMode ===
              "supabase"
                ? "Cloud schedule"
                : "Prototype schedule"}
            </span>

            {" · "}

            {backendMode ===
            "supabase"
              ? "Appointment changes sync with your Rovei Studio."
              : "Appointment status changes currently stay in this browser session."}
          </p>
        </div>

        <ScheduleDateNavigation
          view={view}
          periodLabel={
            view === "today"
              ? `${dayLabel.weekday} · ${dayLabel.dateLabel}`
              : formatScheduleWeekRange(
                  selectedDate,
                )
          }
          isDemoPeriod={
            isDemoPeriod
          }
          onPrevious={() =>
            changePeriod(
              -1,
            )
          }
          onNext={() =>
            changePeriod(
              1,
            )
          }
          onToday={() =>
            setSelectedDate(
              baseDate,
            )
          }
        />
      </section>

      {loadError ||
      actionError ? (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white p-5 shadow-[var(--shadow-card)]"
        >
          <p className="text-sm font-semibold text-[var(--wine)]">
            {loadError ||
              actionError}
          </p>
        </div>
      ) : !hydrated ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="caption">
            Loading schedule…
          </p>
        </div>
      ) : view === "today" ? (
        <section
          id="schedule-today-panel"
          role="tabpanel"
          aria-labelledby="schedule-today-tab"
          className="space-y-5"
        >
          <div>
            <p className="eyebrow mb-2">
              {dayLabel.weekday}
            </p>

            <h2 className="section-title">
              {dayLabel.dateLabel}
            </h2>

            <div className="mt-2">
              <ScheduleReadinessSummary
                appointments={
                  todayAppointments
                }
              />
            </div>
          </div>

          <TodaySchedule
            appointments={
              todayAppointments
            }
            onRequestCancel={
              requestCancel
            }
            onRestore={(
              appointment,
            ) => {
              void restore(
                appointment,
              );
            }}
          />
        </section>
      ) : (
        <section
          id="schedule-week-panel"
          role="tabpanel"
          aria-labelledby="schedule-week-tab"
          className="space-y-5"
        >
          <div>
            <p className="eyebrow mb-2">
              This week
            </p>

            <h2 className="section-title">
              {formatScheduleWeekRange(
                selectedDate,
              )}
            </h2>

            <div className="mt-2">
              <ScheduleReadinessSummary
                appointments={
                  weekAppointments
                }
                week
              />
            </div>
          </div>

          <WeekSchedule
            referenceDate={
              selectedDate
            }
            appointments={
              weekAppointments
            }
            onRequestCancel={
              requestCancel
            }
            onRestore={(
              appointment,
            ) => {
              void restore(
                appointment,
              );
            }}
          />
        </section>
      )}

      <CancelAppointmentDialog
        appointment={
          cancelTarget
            ?.appointment ??
          null
        }
        returnFocusTo={
          cancelTarget
            ?.trigger ??
          null
        }
        onClose={() =>
          setCancelTarget(
            null,
          )
        }
        onConfirm={() => {
          void confirmCancel();
        }}
      />
    </div>
  );
}
