"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import copy from "@/content/console/team-project";
import events from "@/content/console/events";
import shell from "@/content/console/shell";

export default function ProjectControls({ projectId, step, nextNote, quoteLine }) {
  const router = useRouter();
  const [n, setN] = useState(String(step));
  const [note, setNote] = useState(nextNote || "");
  const [q, setQ] = useState({ setup: "", care: "", summary: "" });
  const [update, setUpdate] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function send(action, payload, done) {
    setBusy(action);
    setError("");
    const { data } = await postJson(`/api/console/team/projects/${projectId}`, { action, ...payload });
    setBusy("");
    if (!data.ok) {
      setError(data.message || shell.failed);
      return;
    }
    toast(data.message);
    if (done) done();
    router.refresh();
  }

  return (
    <div className="c-stack">
      <form
        className="c-card"
        onSubmit={(e) => {
          e.preventDefault();
          send("step", { step: Number(n) });
        }}
      >
        <h2>{copy.step.title}</h2>
        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="tp-step">{copy.step.label}</label>
          <select id="tp-step" value={n} onChange={(e) => setN(e.target.value)} aria-describedby="tp-step-help">
            {events.steps.map((s, i) => (
              <option key={s} value={i + 1}>
                {i + 1}. {s}
              </option>
            ))}
          </select>
          <p className="field__hint" id="tp-step-help">
            {copy.step.live}
          </p>
        </div>
        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn btn--solid" type="submit" disabled={busy === "step"}>
            {copy.step.button}
          </button>
        </div>
      </form>

      <form
        className="c-card"
        onSubmit={(e) => {
          e.preventDefault();
          send("note", { text: note });
        }}
      >
        <h2>{copy.next.title}</h2>
        <div className="field" style={{ marginTop: 10 }}>
          <label className="sr-only" htmlFor="tp-note">
            {copy.next.title}
          </label>
          <textarea id="tp-note" value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} aria-describedby="tp-note-help" style={{ minHeight: 80 }} />
          <p className="field__hint" id="tp-note-help">
            {copy.next.help}
          </p>
        </div>
        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn" type="submit" disabled={busy === "note"}>
            {copy.next.save}
          </button>
        </div>
      </form>

      <form
        className="c-card"
        onSubmit={(e) => {
          e.preventDefault();
          send("quote", q, () => setQ({ setup: "", care: "", summary: "" }));
        }}
      >
        <h2>{copy.quote.title}</h2>
        {quoteLine && <p className="note">{quoteLine}</p>}
        <div className="c-grid" style={{ "--n": 2, marginTop: 10 }}>
          <div className="field">
            <label htmlFor="tp-setup">{copy.quote.setup}</label>
            <input id="tp-setup" inputMode="decimal" value={q.setup} onChange={(e) => setQ({ ...q, setup: e.target.value })} aria-describedby="tp-setup-help" />
            <p className="field__hint" id="tp-setup-help">
              {copy.quote.setupHelp}
            </p>
          </div>
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="tp-care">{copy.quote.care}</label>
            <input id="tp-care" inputMode="decimal" value={q.care} onChange={(e) => setQ({ ...q, care: e.target.value })} aria-describedby="tp-care-help" />
            <p className="field__hint" id="tp-care-help">
              {copy.quote.careHelp}
            </p>
          </div>
        </div>
        <div className="field">
          <label htmlFor="tp-summary">{copy.quote.summary}</label>
          <textarea id="tp-summary" value={q.summary} maxLength={4000} onChange={(e) => setQ({ ...q, summary: e.target.value })} style={{ minHeight: 80 }} />
        </div>
        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn" type="submit" disabled={busy === "quote"}>
            {copy.quote.send}
          </button>
        </div>
      </form>

      <form
        className="c-card"
        onSubmit={(e) => {
          e.preventDefault();
          send("update", { text: update }, () => setUpdate(""));
        }}
      >
        <h2>{copy.update.title}</h2>
        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="tp-update">{copy.update.label}</label>
          <textarea id="tp-update" value={update} maxLength={4000} placeholder={copy.update.placeholder} onChange={(e) => setUpdate(e.target.value)} style={{ minHeight: 80 }} />
        </div>
        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn" type="submit" disabled={busy === "update" || !update.trim()}>
            {copy.update.send}
          </button>
        </div>
      </form>
      <p className="field__err" role="alert">
        {error}
      </p>
    </div>
  );
}
