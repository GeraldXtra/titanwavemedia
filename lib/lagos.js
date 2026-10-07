export function lagosTime(date = new Date()) {
  const { hour, minute } = lagosParts(date);
  return clock12(hour, minute);
}

export function daysSince(iso, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86400000));
}

function lagosParts(date) {
  const d = new Date(date.getTime() + 3600000);
  return { day: d.getUTCDay(), hour: d.getUTCHours(), minute: d.getUTCMinutes() };
}

export function clock12(hour, minute) {
  const h = hour % 12 || 12;
  const suffix = hour < 12 ? "am" : "pm";
  return minute === undefined ? `${h} ${suffix}` : `${h}:${String(minute).padStart(2, "0")} ${suffix}`;
}

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
