const pad = (n) => String(n).padStart(2, "0");

export function daysIn(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function billingDate(year, month, day) {
  return `${year}-${pad(month)}-${pad(Math.min(day, daysIn(year, month)))}`;
}

export function nextBillingOn(iso, day) {
  const [y, m] = iso.split("-").map(Number);
  return m === 12 ? billingDate(y + 1, 1, day) : billingDate(y, m + 1, day);
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const dayOf = (iso) => Number(String(iso).slice(8, 10));

export const MIN_PLAN_KOBO = 10000;
export const MAX_PLAN_KOBO = 100000000000;
