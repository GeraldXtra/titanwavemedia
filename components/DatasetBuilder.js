"use client";

import { useEffect, useRef, useState } from "react";
import { datasetRow } from "@/lib/fakeData";
import { format, RV1 } from "@/lib/text";

// "Build a sample dataset": pick fields and rows, make made up data, copy it as CSV.
export default function DatasetBuilder({ copy, initial }) {
  const [fields, setFields] = useState(() => new Set(copy.fields.filter((f) => f.checked).map((f) => f.value)));
  const [count, setCount] = useState(() => (copy.rows.find((r) => r.checked) || copy.rows[0]).value);
  const [data, setData] = useState({ gen: 0, cols: initial.cols, rows: initial.rows, fresh: false });
  const [msg, setMsg] = useState(format(copy.made, { rows: initial.rows.length, fields: initial.cols.length }));
  const [csvText, setCsvText] = useState(null);
  const csvRef = useRef(null);
  const timer = useRef(null);
  const label = (key) => copy.fields.find((f) => f.value === key).label;

  function make() {
    const cols = copy.fields.filter((f) => fields.has(f.value)).map((f) => f.value);
    if (!cols.length) {
      setMsg(copy.noFields);
      return null;
    }
    const n = Number(count) || 5;
    const rows = Array.from({ length: n }, () => datasetRow(cols));
    setData((d) => ({ gen: d.gen + 1, cols, rows, fresh: true }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setData((d) => ({ ...d, fresh: false })), 700);
    setMsg(format(copy.made, { rows: n, fields: cols.length }));
    return { cols, rows };
  }

  // Fresh rows on every visit, like the design.
  useEffect(() => {
    make();
    return () => clearTimeout(timer.current);
  }, []);

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

  // When the clipboard is not available, the CSV appears in a box, already selected.
  useEffect(() => {
    if (csvText !== null && csvRef.current) csvRef.current.select();
  }, [csvText]);

  return (
    <div className="cfg">
      <form className={`box cfg__form ${RV1}`} id="ds-form" noValidate onSubmit={(e) => e.preventDefault()}>
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
                  // Read the tick now: by the time React runs the update, the box may be set back.
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
          <button className="btn btn--dark" type="button" id="ds-make" onClick={make}>
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
            style={{ width: "100%", minHeight: 120, marginTop: 10, border: "2px solid #0B0B0B", padding: 10, fontSize: 13 }}
          />
        )}
      </form>
      <div className={`box ${RV1}`}>
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
