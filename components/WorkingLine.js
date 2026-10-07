"use client";

import { useEffect, useState } from "react";
import site from "@/content/site";
import { clock12, workingStatus } from "@/lib/lagos";
import { format } from "@/lib/text";

export default function WorkingLine({ copy, className, id }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    let timer;
    function tick() {
      setNow(Date.now());
      timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    }
    tick();
    return () => clearTimeout(timer);
  }, []);

  function line(ms) {
    const s = workingStatus(site.hours, new Date(ms));
    if (s.open) return format(copy.open, { time: s.time });
    const at = clock12(s.hour);
    let next = format(copy.nextLater, { time: at, day: copy.days[s.day] });
    if (s.inDays === 0) next = format(copy.nextToday, { time: at });
    if (s.inDays === 1) next = format(copy.nextTomorrow, { time: at });
    return format(copy.closed, { time: s.time, next });
  }

  return (
    <p className={className} id={id}>
      {now === null ? " " : line(now)}
    </p>
  );
}
