"use client";

import { useState } from "react";
import { redactParts } from "@/lib/redact";

// "See it work": paste a message, tick what should come out, and the clean copy follows.
export default function PrivacyDemo({ copy }) {
  const [on, setOn] = useState(() => new Set(copy.kinds.map((k) => k.value)));
  const [text, setText] = useState("");
  const parts = text.trim() ? redactParts(text).parts : [];
  const found = parts.filter((p) => p.kind);
  const out = found.filter((p) => on.has(p.kind)).length;

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
        <label className="sr-only" htmlFor="priv-text">
          {copy.label}
        </label>
        <textarea className="ta" id="priv-text" style={{ marginTop: 18 }} maxLength={1500} placeholder={copy.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
        <fieldset style={{ marginTop: 18 }}>
          <legend>{copy.legend}</legend>
          {copy.kinds.map((k) => (
            <label className="check" key={k.value}>
              <input type="checkbox" name="k" value={k.value} checked={on.has(k.value)} onChange={(e) => toggle(k.value, e.target.checked)} />
              <span>{k.label}</span>
            </label>
          ))}
        </fieldset>
      </form>
      <div className="card">
        <div className={out ? "redact__box is-clean" : "redact__box"} id="redact">
          <div className="redact__label">
            <span>{copy.cleanLabel}</span>
          </div>
          <p className="redact__text" aria-live="polite">
            {!text.trim()
              ? copy.empty
              : parts.map((part, i) =>
                  part.kind ? (
                    <span key={i} className={on.has(part.kind) ? "pii is-out" : "pii"} data-kind={part.kind}>
                      {on.has(part.kind) ? `[${part.kind}]` : part.text}
                    </span>
                  ) : (
                    part.text
                  )
                )}
          </p>
          {text.trim() && !found.length && <p className="note">{copy.none}</p>}
        </div>
      </div>
    </div>
  );
}
