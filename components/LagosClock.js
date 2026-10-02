"use client";

import { useSyncExternalStore } from "react";
import { lagosTime } from "@/lib/lagos";

// One shared timer for every clock on the page. It ticks every 15 seconds, like the design.
let current = null;
let timer = null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  if (!timer) {
    const now = lagosTime();
    if (now !== current) {
      current = now;
      queueMicrotask(notify);
    }
    timer = setInterval(() => {
      current = lagosTime();
      notify();
    }, 15000);
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot() {
  if (current === null) current = lagosTime();
  return current;
}

// The server does not know the visitor's moment, so it renders the design's 00:00.
function getServerSnapshot() {
  return "00:00";
}

export default function LagosClock({ as: Tag = "b" }) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <Tag data-clock="">{time}</Tag>;
}
