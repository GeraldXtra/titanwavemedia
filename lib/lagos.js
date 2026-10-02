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
