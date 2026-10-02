"use client";

import { useState } from "react";
import { RV } from "@/lib/text";

// "How we work with you": four steps in a row. Each one opens to say what happens, and the red
// line above them draws itself as the row scrolls into view (see SiteEffects).
export default function StepsRow({ copy }) {
  const [open, setOpen] = useState([]);
  const toggle = (i) => setOpen((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]));

  return (
    <ol className={`steps steps--row ${RV}`}>
      {copy.steps.map((step, i) => {
        const on = open.includes(i);
        return (
          <li key={i}>
            <button type="button" className="step__btn" aria-expanded={on ? "true" : "false"} onClick={() => toggle(i)}>
              <b aria-hidden="true">{i + 1}</b>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="step__more">{on ? copy.close : copy.more}</span>
            </button>
            <div className="step__detail" hidden={!on}>
              <p>{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
