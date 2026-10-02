"use client";

import { useSyncExternalStore } from "react";
import { daysSince } from "@/lib/lagos";

const noop = () => () => {};

// The current year. The server renders the year of the build and the browser corrects it.
export function Year({ initial }) {
  const year = useSyncExternalStore(
    noop,
    () => String(new Date().getFullYear()),
    () => String(initial)
  );
  return <span data-year="">{year}</span>;
}

// Days since a date, counted in the visitor's browser.
export function DaysSince({ date, initial }) {
  const days = useSyncExternalStore(
    noop,
    () => String(daysSince(date)),
    () => String(initial)
  );
  return <b data-days-since={date}>{days}</b>;
}
