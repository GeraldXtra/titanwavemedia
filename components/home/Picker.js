"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";

// "Who we build for": pick a kind of business to see what we would set up for it.
export default function Picker({ copy }) {
  const [key, setKey] = useState(copy.sectors[0].key);
  const sector = copy.sectors.find((s) => s.key === key);

  return (
    <div className="pick" id="pick">
      <div className="pick__tabs" role="tablist" aria-label={copy.tabsLabel}>
        {copy.sectors.map((s) => (
          <button key={s.key} type="button" role="tab" aria-selected={s.key === key ? "true" : "false"} aria-controls="pick-panel" data-sector={s.key} onClick={() => setKey(s.key)}>
            <Icon name={s.icon} />
            {s.tab}
          </button>
        ))}
      </div>
      <div className="pick__panel" role="tabpanel" id="pick-panel" aria-labelledby="pick-title">
        <div className="box">
          <h3 id="pick-title">{sector.title}</h3>
          <p id="pick-text">{sector.text}</p>
          <div className="btns" style={{ marginTop: 20 }}>
            <Link className="btn btn--line" id="pick-cta" href={`/contact?need=ai-setup&sector=${sector.key}`}>
              {sector.cta}
            </Link>
          </div>
        </div>
        <div className="box">
          <h4>{copy.listTitle}</h4>
          <ul className="pick__list" id="pick-list">
            {sector.list.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
