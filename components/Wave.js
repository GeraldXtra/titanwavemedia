"use client";

import { useEffect, useRef } from "react";
import { createWave } from "@/lib/wave";

// The canvas behind every hero ("night") and in the black data block ("small").
export default function Wave({ kind, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const wave = createWave(ref.current, kind);
    return () => wave.destroy();
  }, [kind]);
  return <canvas ref={ref} className={className} data-wave={kind} aria-hidden="true" />;
}
