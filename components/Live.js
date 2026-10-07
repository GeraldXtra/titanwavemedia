"use client";

import { useSyncExternalStore } from "react";
import { daysSince } from "@/lib/lagos";

const noop = () => () => {};

export function Year({ initial }) {
  const year = useSyncExternalStore(
    noop,
    () => String(new Date().getFullYear()),
    () => String(initial)
  );
  return <span data-year="">{year}</span>;
}

export function DaysSince({ date, initial }) {
  const days = useSyncExternalStore(
    noop,
    () => String(daysSince(date)),
    () => String(initial)
  );
  return <b data-days-since={date}>{days}</b>;
}
