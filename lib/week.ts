// Pitch weeks run Monday 00:00 to Sunday 23:59, Lexington (Eastern) time.
// A week is identified by the date of its Monday, e.g. "2026-10-19".

const TZ = "America/New_York";

function easternParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
  };
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Monday (Eastern) of the week containing `date`, as YYYY-MM-DD. */
export function weekKey(date: Date = new Date()): string {
  const { year, month, day, weekday } = easternParts(date);
  const offset = WEEKDAYS.indexOf(weekday);
  const monday = new Date(Date.UTC(year, month - 1, day - offset));
  return monday.toISOString().slice(0, 10);
}

/** The week before `key`. */
export function previousWeekKey(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}

export function isWeekKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** "Oct 19 – Oct 25" */
export function weekLabel(key: string): string {
  const start = new Date(`${key}T12:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(start)} – ${fmt(end)}`;
}
