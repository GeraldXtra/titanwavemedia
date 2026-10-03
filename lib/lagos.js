// The time in Lagos as HH:MM, for the clocks and the assistant.
export function lagosTime(date = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return "";
  }
}

// Whole days between a date like "2026-04-01" and now.
export function daysSince(iso, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86400000));
}

// Lagos is on West Africa Time, one hour ahead of UTC all year.
function lagosParts(date) {
  const d = new Date(date.getTime() + 3600000);
  return { day: d.getUTCDay(), hour: d.getUTCHours(), minute: d.getUTCMinutes() };
}

// "9:41 am" or "12:05 pm". Without minutes, a whole hour: "9 am".
export function clock12(hour, minute) {
  const h = hour % 12 || 12;
  const suffix = hour < 12 ? "am" : "pm";
  return minute === undefined ? `${h} ${suffix}` : `${h}:${String(minute).padStart(2, "0")} ${suffix}`;
}

// Whether it is working time in Lagos and, if not, when it starts again. `week` lists the days
// from Sunday as [opening hour, closing hour], or null for a closed day.
export function workingStatus(week, date = new Date()) {
  const { day, hour, minute } = lagosParts(date);
  const now = hour * 60 + minute;
  const time = clock12(hour, minute);
  const today = week[day];
  if (today && now >= today[0] * 60 && now < today[1] * 60) return { open: true, time };
  if (today && now < today[0] * 60) return { open: false, time, inDays: 0, day, hour: today[0] };
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    if (week[next]) return { open: false, time, inDays: i, day: next, hour: week[next][0] };
  }
  return { open: false, time };
}
