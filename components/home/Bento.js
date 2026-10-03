"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { bestMatch } from "@/lib/localBrain";
import { redactParts } from "@/lib/redact";
import { demoRow } from "@/lib/fakeData";
import { ph } from "@/lib/text";

const KINDS = ["NAME", "PHONE", "ACCOUNT", "EMAIL"];

// "What we do": four things a visitor can try, three of them live demos.
export default function Bento({ copy }) {
  const c = copy.chat;
  const p = copy.privacy;
  const d = copy.data;
  const bentoRef = useRef(null);
  const timers = useRef(new Set());
  const nextId = useRef(1);

  function later(fn, ms) {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }
  useEffect(() => {
    const all = timers.current;
    return () => all.forEach(clearTimeout);
  }, []);

  // The restaurant chat: chips, a typing box and a short script.
  const greeting = [{ id: 0, from: "assistant", text: c.greeting }];
  const [chat, setChat] = useState(greeting);
  const [used, setUsed] = useState([]);
  const [typed, setTyped] = useState("");

  function add(message) {
    const id = nextId.current++;
    setChat((list) => [...list, { ...message, id }]);
    return id;
  }
  function remove(id) {
    setChat((list) => list.filter((m) => m.id !== id));
  }
  // Start again begins a new round, so an answer still typing from the old round is dropped.
  const round = useRef(0);
  function exchange(question, answer, wait) {
    const asked = round.current;
    add({ from: "customer", text: question });
    const dots = add({ typing: true });
    later(() => {
      remove(dots);
      if (asked === round.current) add({ from: "assistant", text: answer });
    }, wait);
  }
  function askChip(i) {
    if (used.includes(i)) return;
    setUsed((u) => [...u, i]);
    exchange(c.chips[i].question, c.chips[i].answer, 900);
  }
  function resetChat() {
    round.current += 1;
    setChat(greeting);
    setUsed([]);
  }
  function onType(e) {
    e.preventDefault();
    const t = typed.trim();
    if (!t) return;
    setTyped("");
    const best = bestMatch(t, c.script);
    exchange(t, best ? best.answer : c.notSure, 800);
  }

  // Take the personal details out of the message.
  const [message, setMessage] = useState(p.sample);
  const [cleaned, setCleaned] = useState(null);
  const [count, setCount] = useState("");

  function runPrivacy(text = message) {
    const { parts, counts } = redactParts(text);
    setCleaned(parts.length ? parts : []);
    const total = KINDS.reduce((n, k) => n + counts[k], 0);
    setCount(
      total
        ? p.removed +
            " " +
            KINDS.filter((k) => counts[k])
              .map((k) => counts[k] + " " + p.kinds[k][counts[k] > 1 ? 1 : 0])
              .join(", ") +
            "."
        : p.none
    );
  }

  // Five fresh rows of made up data.
  const [kind, setKind] = useState(d.kinds[0].value);
  const [table, setTable] = useState({ gen: 0, head: d.heads[d.kinds[0].value], rows: d.rows, fresh: false });

  function makeRows(k = kind) {
    const rows = Array.from({ length: 5 }, () => demoRow(k));
    setTable((t) => ({ gen: t.gen + 1, head: d.heads[k], rows, fresh: true }));
    later(() => setTable((t) => ({ ...t, fresh: false })), 700);
  }

  // The bento plays through its examples until the visitor touches it.
  const actions = useRef(null);
  actions.current = { askChip, runPrivacy, makeRows, resetChat };
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const panel = bentoRef.current;
    let stopped = false;
    let step = 0;
    let timer = null;
    let visible = true;
    function auto() {
      if (stopped || !visible || document.hidden) return;
      step = (step + 1) % 6;
      const a = actions.current;
      if (step === 1) a.askChip(0);
      if (step === 2) a.askChip(1);
      if (step === 3) a.runPrivacy();
      if (step === 4) a.makeRows();
      if (step === 5) a.resetChat();
      timer = setTimeout(auto, step === 0 ? 1200 : 4200);
    }
    timer = setTimeout(auto, 1600);
    function stop() {
      stopped = true;
      clearTimeout(timer);
    }
    panel.addEventListener("pointerdown", stop);
    panel.addEventListener("keydown", stop);
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        if (visible && !stopped && !timer) timer = setTimeout(auto, 1500);
        if (!visible) {
          clearTimeout(timer);
          timer = null;
        }
      });
      io.observe(panel);
    }
    return () => {
      clearTimeout(timer);
      panel.removeEventListener("pointerdown", stop);
      panel.removeEventListener("keydown", stop);
      if (io) io.disconnect();
    };
  }, []);

  const pr = copy.products;
  const lagos = copy.lagos;

  return (
    <div className="bento" id="bento" ref={bentoRef}>
      <div className="tile tile--2w tile--2h tile--black">
        <Icon name="chat" />
        <h3>{c.title}</h3>
        <p>{c.text}</p>
        <div className="mini">
          <ul className="msgs" id="demo-chat">
            {chat.map((m) =>
              m.typing ? (
                <li key={m.id} className="msg msg--out msg--typing" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </li>
              ) : (
                <li key={m.id} className={m.from === "customer" ? "msg msg--in" : "msg msg--out"}>
                  {m.text}
                  <small>{m.from === "customer" ? c.customer : c.assistant}</small>
                </li>
              )
            )}
          </ul>
          <ul className="chips" id="demo-chips">
            {c.chips.map((chip, i) => (
              <li key={i}>
                <button type="button" data-q={chip.question} data-a={chip.answer} disabled={used.includes(i)} onClick={() => askChip(i)}>
                  {chip.label}
                </button>
              </li>
            ))}
            <li>
              <button type="button" id="demo-chat-reset" onClick={resetChat}>
                {c.reset}
              </button>
            </li>
          </ul>
          <form className="chatline" id="demo-form" noValidate onSubmit={onType}>
            <label className="sr-only" htmlFor="demo-input">
              {c.inputLabel}
            </label>
            <input
              id="demo-input"
              type="text"
              maxLength={200}
              placeholder={c.placeholder}
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
            <button className="btn btn--line btn--sm" type="submit">
              {c.send}
            </button>
          </form>
          <p className="note" style={{ marginTop: 10, color: "rgb(255 255 255/.55)" }}>
            {c.note}
          </p>
        </div>
        <Link className="tile__foot" href={c.foot.href}>
          {c.foot.label}
        </Link>
      </div>

      <div className="tile tile--2w">
        <Icon name="shield" />
        <h3>{p.title}</h3>
        <p>{p.text}</p>
        <div className="mini">
          <label className="sr-only" htmlFor="demo-text">
            {p.label}
          </label>
          <textarea className="ta" id="demo-text" maxLength={800} value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className="demo__row">
            <button className="btn btn--line btn--sm" type="button" id="demo-run" onClick={() => runPrivacy()}>
              {p.button}
            </button>
            <span className="note" id="demo-count">
              {count}
            </span>
          </div>
          <div className="out" id="demo-out" aria-live="polite">
            {cleaned === null
              ? p.start
              : cleaned.length
                ? cleaned.map((part, i) => (part.kind ? <mark key={i}>{`[${part.kind}]`}</mark> : part.text))
                : p.empty}
          </div>
        </div>
        <Link className="tile__foot" href={p.foot.href}>
          {p.foot.label}
        </Link>
      </div>

      <div className="tile tile--2w">
        <Icon name="data" />
        <h3>{d.title}</h3>
        <p>{d.text}</p>
        <div className="mini">
          <div className="demo__row" style={{ margin: "0 0 10px" }}>
            <label className="sr-only" htmlFor="demo-kind">
              {d.label}
            </label>
            <select className="sel" id="demo-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
              {d.kinds.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <button className="btn btn--line btn--sm" type="button" id="demo-make" onClick={() => makeRows()}>
              {d.button}
            </button>
          </div>
          <div className="table-wrap">
            <table className="dt">
              <caption>{d.caption}</caption>
              <thead id="demo-head">
                <tr>
                  {table.head.map((h, i) => (
                    <th key={i} scope="col" className={i === 3 ? "num" : undefined}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody id="demo-rows">
                {table.rows.map((row, r) => (
                  <tr key={`${table.gen}-${r}`} className={table.fresh ? "is-new" : undefined}>
                    {row.map((v, j) => (
                      <td key={j} className={j === 3 ? "num" : undefined}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Link className="tile__foot" href={d.foot.href}>
          {d.foot.label}
        </Link>
      </div>

      <Link className="tile" href={pr.href}>
        <Icon name="tool" />
        <h3>{pr.title}</h3>
        <p>{pr.text}</p>
        <div className="mini">
          <table className="dt">
            <tbody>
              {pr.rows.map((row, i) => (
                <tr key={i}>
                  <td className={ph(row.name)}>{row.name}</td>
                  <td className="num">
                    <span className="tag">{row.tag}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span className="tile__foot">{pr.foot}</span>
      </Link>

      <Link className="tile" href={lagos.href}>
        <Icon name="pin" />
        <h3>{lagos.title}</h3>
        <p>{lagos.text}</p>
        <span className="tile__foot">{lagos.foot}</span>
      </Link>
    </div>
  );
}
