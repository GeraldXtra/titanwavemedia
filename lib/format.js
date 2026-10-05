// Money and dates the way people read them in the console and in emails. Money is kept in kobo
// (100 kobo to the naira); every date is shown in Lagos time.

const TZ = "Africa/Lagos";

// 1250000 kobo -> "₦12,500". Kobo show only when there are some: "₦12,500.50".
export function naira(kobo) {
  const n = Number(kobo || 0) / 100;
  const whole = Number.isInteger(n);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

// Naira typed by a person ("12,500" or "12500.50") -> kobo, or null when it is not a price.
export function toKobo(text) {
  const clean = String(text ?? "").replace(/[₦,\s]/g, "");
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(clean)) return null;
  const [whole, part = ""] = clean.split(".");
  return Number(whole) * 100 + Number(part.padEnd(2, "0"));
}

const fmt = (opts) => new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts });
const dayFmt = fmt({ day: "numeric", month: "long", year: "numeric" });
const shortFmt = fmt({ day: "numeric", month: "short" });
const partsFmt = fmt({ year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short" });

// Dates kept as "2026-10-05" are calendar days; read them at noon so no time zone moves them.
function toDate(value) {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return new Date(`${value}T12:00:00Z`);
  return new Date(value);
}

// "5 October 2026"
export function lagosDay(value) {
  return value ? dayFmt.format(toDate(value)) : "";
}

// "5 Oct"
export function lagosShort(value) {
  return value ? shortFmt.format(toDate(value)) : "";
}

// "4:29 pm"
export function lagosClock(value = new Date()) {
  const p = lagosParts(value);
  const h = p.hour % 12 || 12;
  return `${h}:${String(p.minute).padStart(2, "0")} ${p.hour < 12 ? "am" : "pm"}`;
}

// "5 October 2026, 4:29 pm"
export function lagosDayTime(value) {
  return value ? `${lagosDay(value)}, ${lagosClock(toDate(value))}` : "";
}

// The parts of a moment in Lagos: year, month, day, hour, minute, weekday (0 is Sunday).
export function lagosParts(value = new Date()) {
  const o = {};
  partsFmt.formatToParts(toDate(value)).forEach((p) => (o[p.type] = p.value));
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { year: +o.year, month: +o.month, day: +o.day, hour: +o.hour % 24, minute: +o.minute, weekday: days.indexOf(o.weekday) };
}

// Today in Lagos as "2026-10-05", and that day moved by `days`.
export function lagosToday(days = 0, from = new Date()) {
  const p = lagosParts(from);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  return d.toISOString().slice(0, 10);
}

// Whole days from today in Lagos to the calendar day `iso` (negative when it has passed).
export function daysUntil(iso, from = new Date()) {
  const today = new Date(`${lagosToday(0, from)}T00:00:00Z`).getTime();
  return Math.round((new Date(`${iso}T00:00:00Z`).getTime() - today) / 86400000);
}
