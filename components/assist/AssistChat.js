"use client";

import { useEffect, useRef, useState } from "react";
import words from "@/content/assist";
import { siteAllowsOrigin } from "@/lib/assist/sites";
import AssistText from "./AssistText";
import Handover from "./Handover";

// The chat inside the frame on a business's website (app/assist.js/loader.js adds the frame).
// It reads ?id=, ?test= and #o= (the address of the page it sits in), gets its settings from
// /api/assist/config, and tells that page whether to show the button. It talks only to our own
// API, sets no cookies, and keeps only the conversation id, in its own storage.
// Opened on its own (not in a frame) it still works, without a Close button. A test chat
// (?test=, in the console) shows even when the assistant is off and keeps nothing.

const SRC = "twm-assist";
const fill = (text, values) => String(text).replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

// The conversation id, in this page's own storage, or in memory when storage is blocked.
const memory = new Map();
const kept = {
  get(k) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return memory.get(k) || null;
    }
  },
  set(k, v) {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      memory.set(k, v);
    }
  },
  remove(k) {
    try {
      window.localStorage.removeItem(k);
    } catch {}
    memory.delete(k);
  },
};

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "omit",
    cache: "no-store",
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

export default function AssistChat() {
  const [phase, setPhase] = useState("loading");
  const [cfg, setCfg] = useState(null);
  const [inFrame, setInFrame] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [offer, setOffer] = useState(null);
  const [notice, setNotice] = useState("");

  const ctx = useRef({ id: "", test: "", origin: "", target: null, token: null, conversation: null });
  const messagesRef = useRef([]);
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const business = (cfg && cfg.name && cfg.name.trim()) || words.noName;
  const greeting = { role: "assistant", text: (cfg && cfg.greeting && cfg.greeting.trim()) || fill(words.greeting, { business }), first: true };
  const storeKey = () => `twm-assist:${ctx.current.id}`;
  const closable = inFrame && !(cfg && cfg.test);

  function commit(next) {
    messagesRef.current = next;
    setMessages(next);
  }

  function tell(kind, extra = {}) {
    const { target } = ctx.current;
    if (target && window.parent !== window) window.parent.postMessage({ source: SRC, kind, ...extra }, target);
  }

  // A chat call with the current token. An old token is swapped for a fresh one once.
  async function call(path, body, retry = true) {
    const res = await post(path, { ...body, token: ctx.current.token });
    if (res.status === 401 && retry && res.data && res.data.error === "token") {
      const fresh = await post("/api/assist/config", { id: ctx.current.id, test: ctx.current.test || undefined, origin: ctx.current.origin });
      if (fresh.data && fresh.data.token) {
        ctx.current.token = fresh.data.token;
        return call(path, body, false);
      }
    }
    return res;
  }

  // Loading: settings first, then any open conversation.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const framed = window.parent !== window;
    const c = ctx.current;
    c.id = q.get("id") || "";
    c.test = q.get("test") || "";
    c.origin = hash.get("o") || "";
    setInFrame(framed);

    (async () => {
      let res = null;
      try {
        res = await post("/api/assist/config", { id: c.id, test: c.test || undefined, origin: c.origin });
      } catch {}
      const conf = res && res.data && res.data.ok ? res.data : null;
      if (!conf) return setPhase("closed");
      // The page around the chat hears from it only at its own exact address, and only when
      // that address is one of the business's websites (or our own, for a test).
      if (conf.test) c.target = window.location.origin;
      else if (c.origin && siteAllowsOrigin(conf.sites, c.origin)) c.target = c.origin;
      c.token = conf.token;
      setCfg(conf);
      const name = conf.name && conf.name.trim();
      const buttonLabel = name ? fill(words.label, { business: name }) : words.labelNoName;
      if (framed) {
        if (conf.show && conf.token) tell("ready", { show: true, label: buttonLabel, color: conf.color, textColor: conf.textColor, corner: conf.corner });
        else tell("hide");
      }
      if (!conf.token || (framed && !conf.show)) return setPhase("closed");
      document.title = buttonLabel;

      const first = { role: "assistant", text: (conf.greeting && conf.greeting.trim()) || fill(words.greeting, { business: name || words.noName }), first: true };
      commit([first]);
      setPhase("chat");
      const saved = conf.test ? null : kept.get(storeKey());
      if (!saved) return;
      try {
        const h = await call("/api/assist/history", { conversationId: saved });
        if (h.data && h.data.ok && h.data.open && h.data.messages.length) {
          c.conversation = saved;
          const restored = h.data.messages.map((m) => ({ role: m.role, text: m.text, handover: m.handover }));
          commit([first, ...restored]);
          const last = restored[restored.length - 1];
          if (last && last.role === "assistant" && last.handover) {
            const asked = [...restored].reverse().find((m) => m.role === "customer");
            setOffer({ question: asked ? asked.text : "" });
          }
        } else if (h.data && h.data.ok) {
          kept.remove(storeKey());
        }
      } catch {}
    })();
  }, []);

  // Messages from the page around the chat: only "open", from its exact address and frame.
  useEffect(() => {
    function onMessage(e) {
      const { target } = ctx.current;
      if (!target || e.origin !== target || e.source !== window.parent) return;
      const m = e.data;
      if (!m || typeof m !== "object" || m.source !== SRC) return;
      if (m.kind === "open" && inputRef.current) inputRef.current.focus();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Escape closes the chat; Tab and Shift Tab stay inside it while it is open.
  useEffect(() => {
    if (!closable) return;
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        tell("close");
        return;
      }
      if (e.key !== "Tab" || !rootRef.current) return;
      const items = [...rootRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]')].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !rootRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !rootRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closable]);

  // The newest message stays in view.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, offer, notice]);

  async function send(raw) {
    const text = String(raw || "").trim().slice(0, 500);
    if (!text || pending) return;
    // A starter button goes away once something is asked, so the box takes the focus.
    if (inputRef.current && document.activeElement !== inputRef.current) inputRef.current.focus();
    const before = messagesRef.current;
    commit([...before, { role: "customer", text }]);
    setInput("");
    setPending(true);
    setOffer(null);
    setNotice("");
    const c = ctx.current;
    const body = cfg.test
      ? { text, history: before.filter((m) => !m.first).map((m) => ({ role: m.role, text: m.text })) }
      : { text, conversationId: c.conversation };
    let res = null;
    try {
      res = await call("/api/assist/message", body);
    } catch {}
    setPending(false);
    if (!res) {
      // It never reached us: the message goes back in the box to send again.
      commit(before);
      setInput(text);
      setNotice(words.offline);
      return;
    }
    const ok = res.data && res.data.ok && res.data.reply;
    const reply = ok ? res.data.reply : { text: fill(words.replies.failed, { business }), handover: true };
    if (ok && res.data.conversationId && !cfg.test) {
      c.conversation = res.data.conversationId;
      kept.set(storeKey(), c.conversation);
    }
    commit([...messagesRef.current, { role: "assistant", text: reply.text, handover: reply.handover }]);
    if (reply.handover) setOffer({ question: text });
  }

  function startAgain() {
    const c = ctx.current;
    if (c.conversation && !cfg.test) call("/api/assist/end", { conversationId: c.conversation }).catch(() => {});
    c.conversation = null;
    kept.remove(storeKey());
    commit([greeting]);
    setOffer(null);
    setNotice("");
    setInput("");
    if (inputRef.current) inputRef.current.focus();
  }

  function onWhatsapp() {
    const c = ctx.current;
    if (c.conversation && !cfg.test) call("/api/assist/whatsapp", { conversationId: c.conversation }).catch(() => {});
  }

  async function onDetails(values) {
    try {
      const r = await call("/api/assist/handover", { conversationId: ctx.current.conversation, ...values });
      return r.data || { ok: false };
    } catch {
      return { ok: false };
    }
  }

  if (phase === "loading") {
    return (
      <main className="wa wa--still">
        <p className="wa-quiet" role="status">
          {words.loading}
        </p>
      </main>
    );
  }
  if (phase === "closed") {
    return (
      <main className="wa wa--still">
        <p className="wa-quiet">{words.unavailable}</p>
      </main>
    );
  }

  const settings = { sites: cfg.sites, whatsapp: cfg.whatsapp, phone: cfg.phone, email: cfg.email };
  const asked = messages.some((m) => m.role === "customer");
  const starters = !asked && Array.isArray(cfg.starters) ? cfg.starters.slice(0, 4) : [];

  return (
    <div className="wa" ref={rootRef} style={{ "--wa-color": cfg.color, "--wa-text": cfg.textColor, "--wa-edge": cfg.textColor === "#000000" ? "#0b0b0b" : cfg.color }}>
      <header className="wa-top">
        <h1 className="wa-name">{business}</h1>
        <div className="wa-top__btns">
          <button className="wa-btn wa-btn--sm" type="button" onClick={startAgain}>
            {words.startAgain}
          </button>
          {closable && (
            <button className="wa-close" type="button" aria-label={words.close} onClick={() => tell("close")}>
              <svg aria-hidden="true">
                <use href="#i-close" />
              </svg>
            </button>
          )}
        </div>
      </header>
      <main className="wa-main">
        {cfg.test && <p className="wa-test">{words.test}</p>}

        <div className="wa-body" ref={bodyRef}>
          <div role="log" aria-live="polite" aria-label={words.logLabel}>
            <ol className="wa-log">
              {messages.map((m, i) => (
                <li key={i} className={m.role === "customer" ? "wa-msg wa-msg--you" : "wa-msg wa-msg--them"}>
                  <span className="sr-only">{m.role === "customer" ? words.you : fill(words.them, { business })} </span>
                  <AssistText text={m.text} settings={settings} links={m.role !== "customer"} newTab={words.newTab} />
                </li>
              ))}
              {pending && (
                <li className="wa-msg wa-msg--them wa-typing">
                  <span className="sr-only">{fill(words.typing, { business })}</span>
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                </li>
              )}
            </ol>
          </div>

          {starters.length > 0 && (
            <ul className="wa-starters" aria-label={words.startersLabel}>
              {starters.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {offer && (
            <Handover
              key={messages.length}
              business={business}
              whatsapp={cfg.whatsapp}
              question={offer.question}
              canLeaveDetails={Boolean(cfg.test || ctx.current.conversation)}
              onWhatsapp={onWhatsapp}
              onDetails={onDetails}
            />
          )}
        </div>

        <form
          className="wa-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          {notice && (
            <p className="wa-err" role="alert">
              {notice}
            </p>
          )}
          <div className="wa-form__row">
            <label className="sr-only" htmlFor="wa-input">
              {words.inputLabel}
            </label>
            <input
              id="wa-input"
              ref={inputRef}
              type="text"
              maxLength={500}
              autoComplete="off"
              placeholder={words.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="wa-btn wa-btn--main" type="submit" aria-disabled={pending ? "true" : undefined}>
              {words.send}
            </button>
          </div>
        </form>
      </main>

      <footer className="wa-foot">
        <a href="/privacy-policy#wave-assist" target="_blank" rel="noopener noreferrer">
          {fill(words.footer, { business })}
          <span className="sr-only"> {words.newTab}</span>
        </a>
      </footer>
    </div>
  );
}
