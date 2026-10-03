"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Rich from "./Rich";
import { format } from "@/lib/text";
import { loadChoice, saveChoice } from "@/lib/choices";

// "Build your setup": the summary and the quote link follow the form.
export default function SetupBuilder({ copy }) {
  const [what, setWhat] = useState(() => new Set(copy.what.options.filter((o) => o.checked).map((o) => o.value)));
  const [where, setWhere] = useState(() => (copy.where.options.find((o) => o.checked) || copy.where.options[0]).value);
  const [size, setSize] = useState(() => (copy.size.options.find((o) => o.checked) || copy.size.options[0]).value);
  const s = copy.summary;

  // With "Remember my choices" on (Cookie preferences), the last setup picked here comes back.
  const started = useRef(false);
  useEffect(() => {
    const saved = loadChoice("setup");
    if (!saved) return;
    const known = (list, v) => list.some((o) => o.value === v);
    if (Array.isArray(saved.what)) setWhat(new Set(saved.what.filter((v) => known(copy.what.options, v))));
    if (known(copy.where.options, saved.where)) setWhere(saved.where);
    if (known(copy.size.options, saved.size)) setSize(saved.size);
  }, []);
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    saveChoice("setup", { what: [...what], where, size });
  }, [what, where, size]);

  // Ticked items in the order of the form.
  const ticked = copy.what.options.filter((o) => what.has(o.value)).map((o) => o.value);
  const message = format(s.message, {
    what: ticked.length ? ticked.join(", ") : s.messageNothing,
    where,
    size,
  });

  function toggle(value, on) {
    setWhat((prev) => {
      const next = new Set(prev);
      if (on) next.add(value);
      else next.delete(value);
      return next;
    });
  }

  return (
    <div className="cfg" id="cfg">
      <form className="box cfg__form" id="cfg-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>{copy.what.legend}</legend>
          {copy.what.options.map((o) => (
            <label className="check" key={o.value}>
              <input type="checkbox" name="what" value={o.value} checked={what.has(o.value)} onChange={(e) => toggle(o.value, e.target.checked)} />
              <span>{o.label}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>{copy.where.legend}</legend>
          {copy.where.options.map((o) => (
            <label className="check" key={o.value}>
              <input type="radio" name="where" value={o.value} checked={where === o.value} onChange={() => setWhere(o.value)} />
              <span>{o.label}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>{copy.size.legend}</legend>
          {copy.size.options.map((o) => (
            <label className="check" key={o.value}>
              <input type="radio" name="size" value={o.value} checked={size === o.value} onChange={() => setSize(o.value)} />
              <span>{o.label}</span>
            </label>
          ))}
        </fieldset>
      </form>
      <div className="box cfg__sum">
        <h3>{s.title}</h3>
        <ul id="cfg-list">
          {(ticked.length ? ticked : [s.nothing]).map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>{format(s.answers, { where })}</li>
          <li>{format(s.team, { size })}</li>
        </ul>
        <dl className="cfg__price">
          <div>
            <dt>{s.setup.label}</dt>
            <dd>
              <Rich text={s.setup.value} />
            </dd>
          </div>
          <div>
            <dt>{s.care.label}</dt>
            <dd>
              <Rich text={s.care.value} />
            </dd>
          </div>
        </dl>
        <div className="btns">
          <Link className="btn btn--solid" id="cfg-cta" href={"/contact?need=ai-setup&msg=" + encodeURIComponent(message)}>
            {s.button}
          </Link>
        </div>
        <p className="note" style={{ marginTop: 12 }}>
          {s.note}
        </p>
      </div>
    </div>
  );
}
