"use client";

import { useState } from "react";

// "See it work": what comes out of the message follows the ticks.
export default function PrivacyDemo({ copy }) {
  const [on, setOn] = useState(() => new Set(copy.kinds.map((k) => k.value)));
  const any = copy.message.some((part) => typeof part !== "string" && on.has(part.kind));

  function toggle(kind, checked) {
    setOn((prev) => {
      const next = new Set(prev);
      if (checked) next.add(kind);
      else next.delete(kind);
      return next;
    });
  }

  return (
    <div className="split">
      <form className="box" id="priv-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <h2>{copy.title}</h2>
        <p>{copy.text}</p>
        <fieldset style={{ marginTop: 18 }}>
          <legend>{copy.legend}</legend>
          {copy.kinds.map((k) => (
            <label className="check" key={k.value}>
              <input type="checkbox" name="k" value={k.value} checked={on.has(k.value)} onChange={(e) => toggle(k.value, e.target.checked)} />
              <span>{k.label}</span>
            </label>
          ))}
        </fieldset>
        <p className="sr-only" id="redact-live" role="status" aria-live="polite">
          {any ? copy.removed : copy.original}
        </p>
      </form>
      <div className="card">
        <div className={any ? "redact__box is-clean" : "redact__box"} id="redact">
          <div className="redact__label">
            <span>{copy.label}</span>
            <span>{copy.example}</span>
          </div>
          <p className="redact__text">
            {copy.message.map((part, i) => {
              if (typeof part === "string") return part;
              const out = on.has(part.kind);
              return (
                <span key={i} className={out ? "pii is-out" : "pii"} data-kind={part.kind} data-real={part.text}>
                  {out ? `[${part.kind}]` : part.text}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
