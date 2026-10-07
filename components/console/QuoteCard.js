"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "./Dialog";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/project";

export default function QuoteCard({ projectId, quote, isOwner, business }) {
  const router = useRouter();
  const t = copy.quote;
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function answer(action) {
    setBusy(true);
    setError("");
    const { data } = await postJson(`/api/console/projects/${projectId}/quote`, { action });
    setBusy(false);
    setConfirm(false);
    if (!data.ok) {
      setError(data.message || copy.chat.failed);
      return;
    }
    if (action === "accept") {
      toast(t.acceptedToast);
      router.refresh();
    } else {
      router.refresh();
      const box = document.getElementById("pj-in");
      if (box) box.focus();
    }
  }

  return (
    <div className="c-card">
      <div className="c-row">
        <h2>{t.title}</h2>
        <span className="note">{format(t.sent, { date: quote.sent })}</span>
      </div>
      <div className="c-doc__meta" style={{ gridTemplateColumns: "1fr 1fr", borderBottom: 0, paddingBottom: 0 }}>
        <div>
          <small>{t.setup}</small>
          <b>{quote.setup}</b>
          <span>{format(t.halves, { first: quote.first, second: quote.second })}</span>
        </div>
        <div>
          <small>{t.care}</small>
          <b>{quote.care ? format(t.perMonth, { amount: quote.care }) : t.noCare}</b>
        </div>
      </div>
      {quote.summary && <p style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{quote.summary}</p>}
      {quote.status === "sent" &&
        (isOwner ? (
          <div className="btns" style={{ marginTop: 14 }}>
            <button className="btn btn--solid" type="button" onClick={() => setConfirm(true)} disabled={busy}>
              {t.accept}
            </button>
            <button className="btn" type="button" onClick={() => answer("changes")} disabled={busy}>
              {t.changes}
            </button>
          </div>
        ) : (
          <p className="note" style={{ marginTop: 12 }}>
            {format(t.ownerOnly, { business })}
          </p>
        ))}
      {quote.status === "accepted" && quote.decided && <p className="note" style={{ marginTop: 12 }}>{format(t.accepted, { date: quote.decided })}</p>}
      {quote.status === "changes" && quote.decided && <p className="note" style={{ marginTop: 12 }}>{format(t.changesAsked, { date: quote.decided })}</p>}
      <p className="field__err" role="alert">
        {error}
      </p>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title={t.confirmTitle}>
        <p>{format(t.confirmText, { first: quote.first })}</p>
        <div className="btns" style={{ marginTop: 16 }}>
          <button className="btn btn--solid" type="button" onClick={() => answer("accept")} disabled={busy}>
            {t.confirmButton}
          </button>
          <button className="btn" type="button" onClick={() => setConfirm(false)}>
            {t.cancel}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
