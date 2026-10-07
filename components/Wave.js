"use client";

import { useEffect, useRef } from "react";
import { createWave } from "@/lib/wave";

export default function Wave({ kind, className, fade }) {
  const ref = useRef(null);
  useEffect(() => {
    const wave = createWave(ref.current, kind);
    return () => wave.destroy();
  }, [kind]);
  return <canvas ref={ref} className={className} data-wave={kind} data-fade={fade} aria-hidden="true" />;
}
