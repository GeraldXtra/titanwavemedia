"use client";

import { useEffect, useRef, useState } from "react";
import { datasetRow } from "@/lib/fakeData";
import { format } from "@/lib/text";
import { loadChoice, saveChoice } from "@/lib/choices";

export default function DatasetBuilder({ copy, initial }) {
  const [fields, setFields] = useState(() => new Set(copy.fields.filter((f) => f.checked).map((f) => f.value)));
  const [count, setCount] = useState(() => (copy.rows.find((r) => r.checked) || copy.rows[0]).value);
  const [data, setData] = useState({ gen: 0, cols: initial.cols, rows: initial.rows, fresh: false });
  const made = (rows, n) => format(copy.made, { rows, fields: n === 1 ? copy.oneField : format(copy.manyFields, { n }) });
  const [msg, setMsg] = useState(made(initial.rows.length, initial.cols.length));
  const [csvText, setCsvText] = useState(null);
  const csvRef = useRef(null);
  const timer = useRef(null);
  const label = (key) => copy.fields.find((f) => f.value === key).label;

  function make(picked = fields, howMany = count) {
    const cols = copy.fields.filter((f) => picked.has(f.value)).map((f) => f.value);
    if (!cols.length) {
      setMsg(copy.noFields);
      return null;
    }
    const n = Number(howMany) || 5;
    const rows = Array.from({ length: n }, () => datasetRow(cols));
    setData((d) => ({ gen: d.gen + 1, cols, rows, fresh: true }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setData((d) => ({ ...d, fresh: false })), 700);
    setMsg(made(n, cols.length));
    return { cols, rows };
  }

  const started = useRef(false);
  useEffect(() => {
    const saved = loadChoice("dataset");
    let picked = fields;
    let howMany = count;
    if (saved) {
      if (Array.isArray(saved.fields)) {
        picked = new Set(saved.fields.filter((v) => copy.fields.some((f) => f.value === v)));
        setFields(picked);
      }
      if (copy.rows.some((r) => r.value === saved.count)) {
        howMany = saved.count;
        setCount(howMany);
      }
    }
    make(picked, howMany);
    return () => clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    saveChoice("dataset", { fields: [...fields], count });
  }, [fields, count]);

  function copyCsv() {
    const current = data.rows.length ? data : make() || data;
    const csv = [current.cols.map(label).join(",")]
      .concat(current.rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(",")))
      .join("\n");
    const done = () => setMsg(format(copy.copied, { rows: current.rows.length }));
    const fallback = () => {
      setCsvText(csv);
      setMsg(copy.selectToCopy);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(csv).then(done, fallback);
    else fallback();
  }

  useEffect(() => {
    if (csvText !== null && csvRef.current) csvRef.current.select();
  }, [csvText]);

  return (
    <div className="cfg">
      <form className="box cfg__form" id="ds-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>{copy.fieldsLegend}</legend>
          {copy.fields.map((f) => (
            <label className="check" key={f.value}>
              <input
                type="checkbox"
                name="f"
                value={f.value}
                checked={fields.has(f.value)}
                onChange={(e) => {
                  const on = e.target.checked;
                  setFields((prev) => {
                    const next = new Set(prev);
                    if (on) next.add(f.value);
                    else next.delete(f.value);
                    return next;
                  });
                }}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>{copy.rowsLegend}</legend>
          {copy.rows.map((r) => (
            <label className="check" key={r.value}>
              <input type="radio" name="n" value={r.value} checked={count === r.value} onChange={() => setCount(r.value)} />
              <span>{r.value}</span>
            </label>
          ))}
        </fieldset>
        <div className="btns">
          <button className="btn btn--line" type="button" id="ds-make" onClick={() => make()}>
            {copy.make}
          </button>
          <button className="btn btn--line" type="button" id="ds-copy" onClick={copyCsv}>
            {copy.copy}
          </button>
        </div>
        <p className="note" id="ds-msg" role="status" aria-live="polite" style={{ marginTop: 10 }}>
          {msg}
        </p>
        {csvText !== null && (
          <textarea
            ref={csvRef}
            readOnly
            value={csvText}
            aria-label={copy.csvLabel}
            style={{ width: "100%", minHeight: 120, marginTop: 10, border: "1px solid var(--field-line)", borderRadius: 6, padding: 10, fontSize: 14 }}
          />
        )}
      </form>
      <div className="box">
        <div className="table-wrap">
          <table className="dt" id="ds-table">
            <caption>{copy.caption}</caption>
            <thead>
              <tr>
                {data.cols.map((k) => (
                  <th key={k} scope="col" className={k === "amount" ? "num" : undefined}>
                    {label(k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, r) => (
                <tr key={`${data.gen}-${r}`} className={data.fresh ? "is-new" : undefined}>
                  {row.map((v, j) => (
                    <td key={j} className={data.cols[j] === "amount" ? "num" : undefined}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
