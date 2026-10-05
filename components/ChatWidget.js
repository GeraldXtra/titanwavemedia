"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import BrandMark from "./BrandMark";
import Icon from "./Icon";
import AssistantMessage from "./AssistantMessage";
import assistant from "@/content/assistant";
import { askAssistant } from "@/lib/askAssistant";

const STORE = "twm-chat";

// The site assistant at the bottom right. Full screen on phones.
export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(0);
  const [input, setInput] = useState("");
  const openRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const messagesRef = useRef(messages);

  // The conversation is remembered while the browser tab stays open.
  function commit(next) {
    messagesRef.current = next;
    setMessages(next);
    try {
      sessionStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || "null");
      if (Array.isArray(saved) && saved.length) {
        messagesRef.current = saved;
        setMessages(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending, open]);

  function show(on) {
    setOpen(on);
    document.body.classList.toggle("chat-on", on);
    if (on) {
      if (!messagesRef.current.length) commit([{ role: "assistant", text: assistant.greeting }]);
    } else if (openRef.current) {
      openRef.current.focus();
    }
  }

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") show(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // On a phone the assistant covers the page, so it closes when you go to another page.
  const firstPath = useRef(pathname);
  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    if (open && window.innerWidth < 720) show(false);
  }, [pathname]);

  async function send(raw) {
    const text = String(raw || "").trim();
    if (!text) return;
    const history = [...messagesRef.current, { role: "user", text }];
    commit(history);
    setInput("");
    setPending((n) => n + 1);
    const reply = await askAssistant(history);
    commit([...messagesRef.current, reply]);
    setPending((n) => n - 1);
  }

  return (
    <div className="chat" id="chat">
      <button
        className="chat__open"
        id="chat-open"
        type="button"
        aria-expanded={open ? "true" : "false"}
        aria-controls="chat-panel"
        aria-label={assistant.open}
        ref={openRef}
        onClick={() => show(!open)}
      >
        <BrandMark />
        <span>{assistant.open}</span>
      </button>
      <section className="chat__panel" id="chat-panel" role="dialog" aria-label={assistant.title} hidden={!open} data-native="">
        <div className="chat__top">
          <div>
            <BrandMark />
            <b>{assistant.title}</b>
            <span>{assistant.subtitle}</span>
          </div>
          <button className="chat__close" id="chat-close" type="button" aria-label={assistant.close} onClick={() => show(false)}>
            <Icon name="close" className={null} />
          </button>
        </div>
        <ul className="chat__log" id="chat-log" aria-live="polite" ref={logRef}>
          {messages.map((m, i) => (
            <AssistantMessage key={i} m={m} />
          ))}
          {Array.from({ length: pending }, (_, i) => (
            <li key={`typing-${i}`} className="msg msg--out msg--typing">
              <i />
              <i />
              <i />
            </li>
          ))}
        </ul>
        <ul className="chips" id="chat-chips">
          {assistant.chips.map((c) => (
            <li key={c}>
              <button type="button" onClick={() => send(c)}>
                {c}
              </button>
            </li>
          ))}
        </ul>
        <form
          className="chatline"
          id="chat-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label className="sr-only" htmlFor="chat-input">
            {assistant.inputLabel}
          </label>
          <input
            id="chat-input"
            type="text"
            maxLength={300}
            placeholder={assistant.placeholder}
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            ref={inputRef}
          />
          <button className="btn btn--line btn--sm" type="submit">
            {assistant.send}
          </button>
        </form>
        <p className="note chat__note">{assistant.note}</p>
      </section>
    </div>
  );
}
