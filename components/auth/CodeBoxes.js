"use client";

import { useRef } from "react";
import { format } from "@/lib/text";

export default function CodeBoxes({ value, onChange, onFull, legend, digitLabel, invalid, describedBy, idPrefix = "code" }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  function setAt(i, d) {
    const next = digits.slice();
    next[i] = d;
    const joined = next.join("");
    onChange(joined);
    if (joined.length === 6 && !next.includes("") && onFull) onFull(joined);
  }

  function onInput(i, e) {
    const d = e.target.value.replace(/\D/g, "").slice(-1);
    setAt(i, d);
    if (d && refs.current[i + 1]) refs.current[i + 1].focus();
  }

  function onKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && refs.current[i - 1]) {
      e.preventDefault();
      setAt(i - 1, "");
      refs.current[i - 1].focus();
    }
    if (e.key === "ArrowLeft" && refs.current[i - 1]) refs.current[i - 1].focus();
    if (e.key === "ArrowRight" && refs.current[i + 1]) refs.current[i + 1].focus();
  }

  function onPaste(e) {
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    refs.current[Math.min(text.length, 6) - 1].focus();
    if (text.length === 6 && onFull) onFull(text);
  }

  return (
    <fieldset className="otp" aria-describedby={describedBy}>
      <legend>{legend}</legend>
      {digits.map((d, i) => (
        <input
          key={i}
          id={i === 0 ? `${idPrefix}-0` : undefined}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={format(digitLabel, { n: i + 1 })}
          aria-invalid={invalid ? "true" : undefined}
          onChange={(e) => onInput(i, e)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </fieldset>
  );
}
