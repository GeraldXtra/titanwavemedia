const TZ = "Africa/Lagos";

export function naira(kobo) {
  const n = Number(kobo || 0) / 100;
  const whole = Number.isInteger(n);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

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

function toDate(value) {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return new Date(`${value}T12:00:00Z`);
  return new Date(value);
}

export function lagosDay(value) {
  return value ? dayFmt.format(toDate(value)) : "";
}

export function lagosShort(value) {
  return value ? shortFmt.format(toDate(value)) : "";
}

export function lagosClock(value = new Date()) {
  const p = lagosParts(value);
  const h = p.hour % 12 || 12;
  return `${h}:${String(p.minute).padStart(2, "0")} ${p.hour < 12 ? "am" : "pm"}`;
}

export function lagosDayTime(value) {
  return value ? `${lagosDay(value)}, ${lagosClock(toDate(value))}` : "";
}

export function lagosParts(value = new Date()) {
  const o = {};
  partsFmt.formatToParts(toDate(value)).forEach((p) => (o[p.type] = p.value));
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { year: +o.year, month: +o.month, day: +o.day, hour: +o.hour % 24, minute: +o.minute, weekday: days.indexOf(o.weekday) };
}

export function lagosToday(days = 0, from = new Date()) {
  const p = lagosParts(from);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  return d.toISOString().slice(0, 10);
}

export function daysUntil(iso, from = new Date()) {
  const today = new Date(`${lagosToday(0, from)}T00:00:00Z`).getTime();
  return Math.round((new Date(`${iso}T00:00:00Z`).getTime() - today) / 86400000);
}
