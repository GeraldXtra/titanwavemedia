"use client";

import { useRef, useState } from "react";
import site from "@/content/site";
import { EMAIL } from "@/lib/validate";

const copy = site.notifyForm;

export default function NotifyForm({ inputId, thanks = copy.thanks, source }) {
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const [msg, setMsg] = useState({ state: "", text: "" });
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (sending) return;
    const input = inputRef.current;
    const value = input.value.trim();
    if (!EMAIL.test(value)) {
      setMsg({ state: "is-err", text: value ? copy.invalid : copy.empty });
      input.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error("not saved");
      setMsg({ state: "is-ok", text: thanks });
      formRef.current.reset();
    } catch {
      setMsg({ state: "is-err", text: copy.failed });
    } finally {
      setSending(false);
    }
  }

  return (
    <form ref={formRef} className="js-notify" noValidate data-ok={thanks} onSubmit={onSubmit}>
      <div className="inline-form">
        <div className="field">
          <label className="sr-only" htmlFor={inputId}>
            {copy.label}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            placeholder={copy.placeholder}
            required
          />
        </div>
        <button className="btn btn--line" type="submit" aria-disabled={sending || undefined} aria-busy={sending || undefined}>
          {copy.button}
        </button>
      </div>
      <p className={msg.state ? `form-msg ${msg.state}` : "form-msg"} role="status" aria-live="polite">
        {msg.text}
      </p>
    </form>
  );
}
