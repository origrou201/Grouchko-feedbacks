import { TIME_ZONE } from "@/lib/constants";

const dateTimeFormatter = new Intl.DateTimeFormat("he-IL", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/** True for strings like 2026-10-27 that are real calendar dates. */
export function isDateString(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** The UTC moment when the given calendar day starts in Israel. */
export function startOfDayInIsrael(dateString: string, addDays = 0): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day + addDays);
  return new Date(utcMidnight - timeZoneOffsetMs(new Date(utcMidnight)));
}

function timeZoneOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - date.getTime();
}
