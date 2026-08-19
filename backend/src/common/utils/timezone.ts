export const APP_TIMEZONE = "Africa/Cairo";

export interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (timeZone: string): Intl.DateTimeFormat => {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
};

export const localParts = (
  date: Date,
  timeZone: string = APP_TIMEZONE
): LocalParts => {
  const parts = getFormatter(timeZone).formatToParts(date);
  const read = (type: string): number =>
    Number(parts.find((p) => p.type === type)?.value ?? NaN);
  let hour = read("hour");
  if (hour === 24) hour = 0;
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour,
    minute: read("minute"),
    second: read("second"),
  };
};

const offsetMs = (date: Date, timeZone: string): number => {
  const p = localParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const truncated = Math.trunc(date.getTime() / 1000) * 1000;
  return asUtc - truncated;
};

export const dateInTz = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
  timeZone: string = APP_TIMEZONE
): Date => {
  const target = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  let instant = target;
  for (let i = 0; i < 4; i += 1) {
    instant = target - offsetMs(new Date(instant), timeZone);
  }
  return new Date(instant);
};

export const toLocalDateString = (
  date: Date,
  timeZone: string = APP_TIMEZONE
): string => {
  const p = localParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
};

export const startOfDayInTz = (
  date: Date,
  timeZone: string = APP_TIMEZONE
): Date => {
  const p = localParts(date, timeZone);
  return dateInTz(p.year, p.month, p.day, 0, 0, 0, 0, timeZone);
};

export const endOfDayInTz = (
  date: Date,
  timeZone: string = APP_TIMEZONE
): Date => {
  const p = localParts(date, timeZone);
  return dateInTz(p.year, p.month, p.day, 23, 59, 59, 999, timeZone);
};

export const screeningDateTime = (
  date: Date,
  startTime: string,
  timeZone: string = APP_TIMEZONE
): Date => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const p = localParts(date, timeZone);
  return dateInTz(p.year, p.month, p.day, hours, minutes, 0, 0, timeZone);
};

export const hasScreeningStarted = (
  date: Date,
  startTime: string,
  now: Date = new Date(),
  timeZone: string = APP_TIMEZONE
): boolean => screeningDateTime(date, startTime, timeZone).getTime() < now.getTime();