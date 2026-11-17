// Helpers shared by the landing page sections.

export const DAYS = [
  { key: "mon", api: "monday", short: "Mon", long: "Monday" },
  { key: "tue", api: "tuesday", short: "Tue", long: "Tuesday" },
  { key: "wed", api: "wednesday", short: "Wed", long: "Wednesday" },
  { key: "thu", api: "thursday", short: "Thu", long: "Thursday" },
  { key: "fri", api: "friday", short: "Fri", long: "Friday" },
  { key: "sat", api: "saturday", short: "Sat", long: "Saturday" },
  { key: "sun", api: "sunday", short: "Sun", long: "Sunday" },
];

const DAY_MINUTES = 1440;
const WEEK_MINUTES = DAY_MINUTES * 7;
const JST_OFFSET = 9 * 60; // Japan has no daylight saving time

// index into DAYS (Monday = 0) for the visitor's today
export const todayIndex = () => (new Date().getDay() + 6) % 7;

// minutes the visitor's clock is ahead of Japan's (negative = behind)
const offsetFromJst = () => -new Date().getTimezoneOffset() - JST_OFFSET;

// MAL broadcasts are given in Japan time ("Mondays", "21:30"). Returns the
// visitor's local { day (Monday = 0), minutes after midnight }, or null.
export function toLocalBroadcast(broadcast) {
  if (!broadcast || !broadcast.day || !broadcast.time) return null;
  const day = DAYS.findIndex((d) =>
    broadcast.day.toLowerCase().startsWith(d.api),
  );
  const match = /^(\d{1,2}):(\d{2})$/.exec(broadcast.time);
  if (day < 0 || !match) return null;
  const jst = day * DAY_MINUTES + Number(match[1]) * 60 + Number(match[2]);
  const local =
    (((jst + offsetFromJst()) % WEEK_MINUTES) + WEEK_MINUTES) % WEEK_MINUTES;
  return {
    day: Math.floor(local / DAY_MINUTES),
    minutes: local % DAY_MINUTES,
  };
}

// The Japan-time schedule days whose shows can land on the visitor's local
// `dayIndex` (one or two days, depending on the time zone).
export function jstDaysFor(dayIndex) {
  const start =
    (((dayIndex * DAY_MINUTES - offsetFromJst()) % WEEK_MINUTES) +
      WEEK_MINUTES) %
    WEEK_MINUTES;
  const first = Math.floor(start / DAY_MINUTES);
  const last = Math.floor(((start + DAY_MINUTES - 1) % WEEK_MINUTES) / DAY_MINUTES);
  return first === last ? [first] : [first, last];
}

// 21:30 -> "9:30 PM" (or "21:30"), in the visitor's own clock style
export function formatMinutes(minutes) {
  const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// "GMT-3", "EST", ...
export function timeZoneLabel() {
  try {
    const part = new Intl.DateTimeFormat([], { timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName");
    return part ? part.value : "your time zone";
  } catch (error) {
    return "your time zone";
  }
}

// MAL synopses often end with a credit line like "[Written by MAL Rewrite]"
export const cleanSynopsis = (text) =>
  (text || "").replace(/\s*\[Written by[^\]]*\]\s*$/i, "").trim();

const capitalize = (word) => (word ? word[0].toUpperCase() + word.slice(1) : "");

// "Fall 2027", "2027" or "Date to be announced"
export function releaseLabel(item) {
  if (item.season && item.year) return `${capitalize(item.season)} ${item.year}`;
  const from = item.aired && item.aired.prop && item.aired.prop.from;
  if (from && from.year) return String(from.year);
  return "Date TBA";
}

// "Since 1989", "Since Mar 2026"
export function sinceLabel(isoDate, withMonth = false) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return `Since ${
    withMonth
      ? date.toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" })
      : date.getUTCFullYear()
  }`;
}

// MAL dates are calendar dates stored as midnight UTC; read them as UTC so
// they don't slip to the previous day west of Greenwich
export const shortDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
