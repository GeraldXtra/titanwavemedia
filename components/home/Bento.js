"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import AssistantMessage from "../AssistantMessage";
import { askAssistant } from "@/lib/askAssistant";
import { redactParts } from "@/lib/redact";
import { demoRow } from "@/lib/fakeData";
import { ph } from "@/lib/text";

const KINDS = ["NAME", "PHONE", "ACCOUNT", "EMAIL"];

// "What we do": four things a visitor can try: our own site assistant, the tool that takes
// personal details out of a message, and the maker of made up data.
export default function Bento({ copy }) {
  const c = copy.chat;
  const p = copy.privacy;
  const d = copy.data;
  const bentoRef = useRef(null);
  const timers = useRef(new Set());

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

  // A real conversation with our site assistant, with a few starter questions.
  const greeting = [{ role: "assistant", text: c.greeting }];
  const [chat, setChat] = useState(greeting);
  const [pending, setPending] = useState(0);
  const [typed, setTyped] = useState("");
  const chatRef = useRef(greeting);
  const logRef = useRef(null);
  const round = useRef(0);

  function commit(list) {
    chatRef.current = list;
    setChat(list);
  }
  async function ask(raw) {
    const text = String(raw || "").trim();
    if (!text || pending) return;
    const asked = round.current;
    const history = [...chatRef.current, { role: "user", text }];
    commit(history);
    setTyped("");
    setPending(1);
    const reply = await askAssistant(history.slice(1));
    setPending(0);
    if (asked === round.current) commit([...chatRef.current, reply]);
  }
  // Start again begins a new round, so an answer still on its way is dropped.
  function resetChat() {
    round.current += 1;
    setPending(0);
    commit(greeting);
  }
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chat, pending]);

  // Take the personal details out of the message.
  const [message, setMessage] = useState("");
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

  const pr = copy.products;
  const lagos = copy.lagos;

  return (
    <div className="bento" id="bento" ref={bentoRef}>
      <div className="tile tile--2w tile--2h tile--black">
        <Icon name="chat" />
        <h3>{c.title}</h3>
        <p>{c.text}</p>
        <div className="mini">
          <ul className="msgs" id="demo-chat" aria-live="polite" ref={logRef}>
            {chat.map((m, i) => (
              <AssistantMessage key={i} m={m} />
            ))}
            {pending > 0 && (
              <li className="msg msg--out msg--typing" aria-hidden="true">
                <i />
                <i />
                <i />
              </li>
            )}
          </ul>
          <ul className="chips" id="demo-chips">
            {c.chips.map((q) => (
              <li key={q}>
                <button type="button" disabled={pending > 0} onClick={() => ask(q)}>
                  {q}
                </button>
              </li>
            ))}
            <li>
              <button type="button" id="demo-chat-reset" onClick={resetChat}>
                {c.reset}
              </button>
            </li>
          </ul>
          <form
            className="chatline"
            id="demo-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              ask(typed);
            }}
          >
            <label className="sr-only" htmlFor="demo-input">
              {c.inputLabel}
            </label>
            <input
              id="demo-input"
              type="text"
              maxLength={500}
              placeholder={c.placeholder}
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
            <button className="btn btn--line btn--sm" type="submit" disabled={pending > 0}>
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
          <textarea className="ta" id="demo-text" maxLength={800} placeholder={p.placeholder} value={message} onChange={(e) => setMessage(e.target.value)} />
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
