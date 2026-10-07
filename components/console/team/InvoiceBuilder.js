"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../Icon";
import { InvoiceDoc } from "../Docs";
import { postJson } from "@/lib/client";
import { lagosToday, naira, toKobo } from "@/lib/format";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/team-invoices";

const blank = () => ({ d: "", q: "1", p: "" });

export default function InvoiceBuilder({ clients }) {
  const router = useRouter();
  const f = copy.form;
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [lines, setLines] = useState([blank()]);
  const [days, setDays] = useState(7);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const c = clients.find((x) => x.id === client);
  const priced = lines.map((l) => ({ description: l.d.trim(), quantity: Math.max(1, parseInt(l.q, 10) || 1), unit_kobo: toKobo(l.p) || 0 }));
  const total = priced.reduce((a, l) => a + l.quantity * l.unit_kobo, 0);
  const draft = {
    number: copy.preview.number,
    billed_business: c ? c.name : f.chooseClient,
    billed_name: c ? c.contact : "",
    billed_email: c ? c.email : "",
    billed_address: c ? c.address : "",
    issued_at: new Date().toISOString(),
    due_on: lagosToday(days),
    status: "due",
    note: note.trim(),
  };
  const previewLines = priced.filter((l) => l.description || l.unit_kobo).map((l) => ({ ...l, description: l.description || "", amount_kobo: l.quantity * l.unit_kobo }));
  const set = (i, k, val) => setLines(lines.map((l, j) => (j === i ? { ...l, [k]: val } : l)));

  async function send(e) {
    e.preventDefault();
    if (!client) {
      setError(f.errors.client);
      return document.getElementById("ni-client").focus();
    }
    if (!priced.length || priced.some((l) => !l.description || !l.unit_kobo)) return setError(f.errors.lines);
    setBusy(true);
    setError("");
    const { data } = await postJson("/api/console/team/invoices", { business: client, project: project || null, days, note: note.trim(), lines: priced });
    setBusy(false);
    if (!data.ok) return setError(data.message || f.errors.failed);
    toast(format(f.sent, { business: c.name }));
    setLines([blank()]);
    setNote("");
    router.refresh();
  }

  return (
    <div className="c-split">
      <form className="c-card" onSubmit={send} noValidate>
        <h2>{f.title}</h2>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="ni-client">{f.client}</label>
          <select
            id="ni-client"
            value={client}
            onChange={(e) => {
              setClient(e.target.value);
              setProject("");
            }}
          >
            <option value="">{clients.length ? f.chooseClient : f.noClients}</option>
            {clients.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
        {c && c.projects.length > 0 && (
          <div className="field">
            <label htmlFor="ni-project">{f.project}</label>
            <select id="ni-project" value={project} onChange={(e) => setProject(e.target.value)}>
              <option value="">{f.noProject}</option>
              {c.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <fieldset className="field" style={{ border: 0, padding: 0, margin: "14px 0 0" }}>
          <legend style={{ fontSize: 14, fontWeight: 700, marginBottom: 7 }}>{f.lines}</legend>
          <div className="c-lines">
            {lines.map((l, i) => (
              <div className="c-line" key={i} role="group" aria-label={format(f.line, { n: i + 1 })}>
                <input aria-label={f.description} placeholder={f.description} value={l.d} maxLength={200} onChange={(e) => set(i, "d", e.target.value)} />
                <input aria-label={f.qty} inputMode="numeric" value={l.q} onChange={(e) => set(i, "q", e.target.value.replace(/\D/g, ""))} />
                <input aria-label={f.price} placeholder={f.pricePlaceholder} inputMode="decimal" value={l.p} onChange={(e) => set(i, "p", e.target.value.replace(/[^\d.,]/g, ""))} />
                <button className="c-close" type="button" aria-label={format(f.removeLine, { n: i + 1 })} onClick={() => setLines(lines.length > 1 ? lines.filter((_, j) => j !== i) : [blank()])}>
                  <Icon name="close" className={null} />
                </button>
              </div>
            ))}
          </div>
          <button className="btn btn--sm" type="button" style={{ marginTop: 8 }} onClick={() => setLines([...lines, blank()])}>
            <Icon name="plus" />
            {f.addLine}
          </button>
        </fieldset>
        <div className="field">
          <label htmlFor="ni-due">{f.due}</label>
          <select id="ni-due" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {f.dueOptions.map((o) => (
              <option key={o.days} value={o.days}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ni-note">{f.note}</label>
          <input id="ni-note" value={note} maxLength={500} placeholder={f.notePlaceholder} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="c-row" style={{ marginTop: 16 }}>
          <b style={{ fontSize: 20 }}>{format(f.total, { total: naira(total) })}</b>
          <button className="btn btn--solid" type="submit" disabled={busy}>
            {f.send}
          </button>
        </div>
        <p className="field__err" role="alert">
          {error}
        </p>
      </form>
      <div className="c-card">
        <div className="c-row">
          <h2>{copy.preview.title}</h2>
          <span className="note">{copy.preview.note}</span>
        </div>
        <div style={{ marginTop: 12 }} aria-live="off">
          <InvoiceDoc inv={draft} lines={previewLines} mini />
        </div>
      </div>
    </div>
  );
}
