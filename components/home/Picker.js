"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";

const allMessages = (sector) => sector.chat.flatMap((pair) => pair.map((text, i) => ({ text, out: i > 0 })));

// "Who we build for": the plan and the example conversation follow the kind of business.
export default function Picker({ copy }) {
  const [key, setKey] = useState(copy.sectors[0].key);
  const [shown, setShown] = useState(() => allMessages(copy.sectors[0]));
  const timers = useRef([]);
  const sector = copy.sectors.find((s) => s.key === key);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // The new conversation types itself in, one message after another.
  function select(next) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setKey(next);
    setShown([]);
    let delay = 0;
    allMessages(copy.sectors.find((s) => s.key === next)).forEach((m) => {
      delay += m.out ? 700 : 400;
      timers.current.push(setTimeout(() => setShown((list) => [...list, m]), delay));
    });
  }

  return (
    <div className="pick" id="pick">
      <div className="pick__tabs" role="tablist" aria-label={copy.tabsLabel}>
        {copy.sectors.map((s) => (
          <button key={s.key} type="button" role="tab" aria-selected={s.key === key ? "true" : "false"} data-sector={s.key} onClick={() => select(s.key)}>
            <Icon name={s.icon} />
            {s.tab}
          </button>
        ))}
      </div>
      <div className="pick__panel" role="tabpanel">
        <div className="box">
          <h3 id="pick-title">{sector.title}</h3>
          <p id="pick-text">{sector.text}</p>
          <ul className="pick__list" id="pick-list">
            {sector.list.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <div className="btns" style={{ marginTop: 20 }}>
            <Link className="btn btn--line" id="pick-cta" href={`/contact?need=ai-setup&sector=${sector.key}`}>
              {sector.cta}
            </Link>
          </div>
        </div>
        <div className="box">
          <p className="note" style={{ marginBottom: 12 }}>
            {copy.note}
          </p>
          <div className="mini">
            <ul className="msgs" id="pick-chat">
              {shown.map((m, i) => (
                <li key={`${key}-${i}`} className={m.out ? "msg msg--out" : "msg msg--in"}>
                  {m.text}
                  <small>{m.out ? copy.assistant : copy.customer}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
