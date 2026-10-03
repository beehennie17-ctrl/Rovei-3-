import type {
  ScheduleAppointment,
  ScheduleAppointmentStatus,
  ScheduleAppointmentView,
  ScheduleStatusOverride,
} from "@/types/schedule";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function parseScheduleDate(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function formatScheduleDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addScheduleDays(value: string, amount: number): string {
  const date = parseScheduleDate(value);
  if (!date) return value;
  date.setDate(date.getDate() + amount);
  return formatScheduleDateOnly(date);
}

export function getMondayStart(value: string): string {
  const date = parseScheduleDate(value);
  if (!date) return value;
  const weekday = date.getDay();
  const distance = weekday === 0 ? -6 : 1 - weekday;
  date.setDate(date.getDate() + distance);
  return formatScheduleDateOnly(date);
}

export function getScheduleWeekDates(value: string): string[] {
  const monday = getMondayStart(value);
  return Array.from({ length: 7 }, (_, index) => addScheduleDays(monday, index));
}

export function formatScheduleDay(value: string): { weekday: string; dateLabel: string; shortLabel: string } {
  const date = parseScheduleDate(value);
  if (!date) return { weekday: "", dateLabel: value, shortLabel: value };
  return {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date),
    dateLabel: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }).format(date),
    shortLabel: `${new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date)} · ${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`,
  };
}

export function formatScheduleWeekRange(value: string): string {
  const dates = getScheduleWeekDates(value);
  const start = parseScheduleDate(dates[0]);
  const end = parseScheduleDate(dates[6]);
  if (!start || !end) return value;

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const startLabel = `${start.getDate()} ${SHORT_MONTHS[start.getMonth()]}${sameYear ? "" : ` ${start.getFullYear()}`}`;
  const endLabel = `${end.getDate()}${sameMonth ? "" : ` ${SHORT_MONTHS[end.getMonth()]}`} ${end.getFullYear()}`;
  return `${startLabel} – ${endLabel}`;
}

function timeToMinutes(value: string): number {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(value);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]) % 12;
  if (match[3] === "PM") hour += 12;
  return hour * 60 + Number(match[2]);
}

export function sortScheduleAppointments<T extends ScheduleAppointment>(appointments: T[]): T[] {
  return [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare === 0 ? timeToMinutes(a.time) - timeToMinutes(b.time) : dateCompare;
  });
}

export function getAppointmentsForDate(appointments: ScheduleAppointment[], date: string): ScheduleAppointment[] {
  return sortScheduleAppointments(appointments.filter((appointment) => appointment.date === date));
}

export function groupAppointmentsByDate(appointments: ScheduleAppointment[]): Record<string, ScheduleAppointment[]> {
  return sortScheduleAppointments(appointments).reduce<Record<string, ScheduleAppointment[]>>((groups, appointment) => {
    (groups[appointment.date] ??= []).push(appointment);
    return groups;
  }, {});
}

export function getAppointmentsForWeek(appointments: ScheduleAppointment[], referenceDate: string): ScheduleAppointment[] {
  const weekDates = new Set(getScheduleWeekDates(referenceDate));
  return sortScheduleAppointments(appointments.filter((appointment) => weekDates.has(appointment.date)));
}

export function getEffectiveScheduleStatus(
  appointment: ScheduleAppointment,
  overrides: ScheduleStatusOverride[],
): ScheduleAppointmentStatus {
  if (appointment.status === "complete") return "complete";
  return overrides.some((override) => override.appointmentId === appointment.id) ? "cancelled" : appointment.status;
}

export function applyScheduleOverrides(
  appointments: ScheduleAppointment[],
  overrides: ScheduleStatusOverride[],
): ScheduleAppointmentView[] {
  return appointments.map((appointment) => ({
    ...appointment,
    effectiveStatus: getEffectiveScheduleStatus(appointment, overrides),
  }));
}

export function summarizeScheduleAppointments(appointments: ScheduleAppointmentView[]) {
  return {
    total: appointments.length,
    ready: appointments.filter((appointment) => appointment.effectiveStatus === "ready").length,
    waiting: appointments.filter((appointment) => appointment.effectiveStatus === "waiting").length,
    complete: appointments.filter((appointment) => appointment.effectiveStatus === "complete").length,
    cancelled: appointments.filter((appointment) => appointment.effectiveStatus === "cancelled").length,
    draft: appointments.filter((appointment) => appointment.effectiveStatus === "draft").length,
  };
}
