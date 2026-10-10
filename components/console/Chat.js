"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { postJson } from "@/lib/client";

export default function Chat({ title, sub, status, url, initial = [], words, inputId, quick, top, chip, after }) {
  const [messages, setMessages] = useState(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const list = useRef(null);
  const count = useRef(initial.length);

  const load = useCallback(async () => {
    if (document.hidden) return;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) setMessages(data.messages);
    } catch {}
  }, [url]);

  useEffect(() => {
    setMessages(initial);
    count.current = initial.length;
  }, [url]);

  useEffect(() => {
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (list.current && messages.length !== count.current) list.current.scrollTop = list.current.scrollHeight;
    count.current = messages.length;
  }, [messages]);
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, []);

  async function send(e) {
    if (e) e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError("");
    const { data } = await postJson(url, { body });
    setBusy(false);
    if (data.ok) {
      setText("");
      if (Array.isArray(data.messages)) setMessages(data.messages);
      if (after) after(data);
    } else {
      setError(data.message || words.failed);
    }
  }

  return (
    <div className="c-chat">
      <div className="c-chat__top">
        <div>
          <b>{title}</b>
          {status && (
            <small>
              <span className={`c-online${status.on ? " is-on" : ""}`} aria-hidden="true" />
              {status.text}
            </small>
          )}
          {sub && <small>{sub}</small>}
        </div>
        {chip}
      </div>
      {top}
      <ul className="c-msgs" ref={list} aria-live="polite" aria-label={title}>
        {messages.length ? (
          messages.map((m) => (
            <li key={m.id} className={`c-msg ${m.mine ? "c-msg--out" : "c-msg--in"}`}>
              {m.body}
              <small>
                {m.who}, {m.at}
              </small>
            </li>
          ))
        ) : (
          <li className="c-msg c-msg--sys">{words.empty}</li>
        )}
      </ul>
      {quick && quick.length > 0 && (
        <ul className="c-quick">
          {quick.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => {
                  setText(q);
                  document.getElementById(inputId).focus();
                }}
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="c-chatline" onSubmit={send} noValidate>
        <label className="sr-only" htmlFor={inputId}>
          {words.label}
        </label>
        <textarea
          id={inputId}
          rows={2}
          value={text}
          maxLength={4000}
          placeholder={words.placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          aria-describedby={error ? `${inputId}-err` : undefined}
        />
        <button className="btn" type="submit" disabled={busy || !text.trim()} aria-busy={busy || undefined}>
          {words.send}
        </button>
      </form>
      {error && (
        <p className="field__err" id={`${inputId}-err`} role="alert" style={{ padding: "0 14px 12px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
