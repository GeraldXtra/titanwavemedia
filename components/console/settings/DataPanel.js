"use client";

import { useState } from "react";
import Icon from "../../Icon";
import Dialog from "../Dialog";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import copy from "@/content/console/settings";

const t = copy.data;

// Your data: download everything, or delete the account (owners only, and not while an
// invoice is unpaid).
export default function DataPanel({ owner, business, unpaid }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function remove(e) {
    e.preventDefault();
    if (typed.trim() !== business) {
      setError(t.confirmWrong);
      document.getElementById("del-confirm").focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/account", { confirm: typed.trim() }, { method: "DELETE" });
    if (data.ok) {
      window.location.assign("/signin?deleted=1");
      return;
    }
    setBusy(false);
    setError(data.message || copy.failed);
  }

  return (
    <div className="c-split">
      <div className="c-card">
        <h2>{t.download}</h2>
        <p style={{ marginTop: 6 }}>{t.downloadText}</p>
        <div className="btns" style={{ marginTop: 14 }}>
          <a className="btn" href="/api/console/export" download>
            <Icon name="download" />
            {t.downloadButton}
          </a>
        </div>
      </div>
      <div className="c-card">
        <h2>{t.delete}</h2>
        <p style={{ marginTop: 6 }}>{t.deleteText}</p>
        {!owner ? (
          <p className="note" style={{ marginTop: 10 }}>
            {format(t.ownerOnly, { business })}
          </p>
        ) : unpaid ? (
          <p className="note" style={{ marginTop: 10 }}>
            {t.unpaid}
          </p>
        ) : null}
        <div className="btns" style={{ marginTop: 14 }}>
          <button className="btn btn--danger" type="button" disabled={!owner || unpaid} onClick={() => setOpen(true)}>
            {t.deleteButton}
          </button>
        </div>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title={t.confirmTitle}>
        <form onSubmit={remove} noValidate>
          <p>{format(t.confirmText, { business })}</p>
          <div className="field" style={{ marginTop: 12 }} data-err={error ? "" : undefined}>
            <label htmlFor="del-confirm">{format(t.confirmLabel, { business })}</label>
            <input id="del-confirm" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} aria-invalid={error ? "true" : undefined} aria-describedby="del-err" />
            <p className="field__err" id="del-err">
              {error}
            </p>
          </div>
          <div className="btns" style={{ marginTop: 14 }}>
            <button className="btn btn--danger" type="submit" disabled={busy}>
              {t.confirmButton}
            </button>
            <button className="btn" type="button" onClick={() => setOpen(false)}>
              {t.keep}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
