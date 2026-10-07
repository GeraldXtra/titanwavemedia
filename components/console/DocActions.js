"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../Icon";
import Dialog from "./Dialog";
import { postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import invoiceCopy from "@/content/console/invoice";
import receiptCopy from "@/content/console/receipt";
import shell from "@/content/console/shell";

export function PrintButton() {
  return (
    <button className="btn" type="button" onClick={() => window.print()}>
      <Icon name="download" />
      {invoiceCopy.print}
    </button>
  );
}

export function RemindButton({ number, solid = false }) {
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    const { data } = await postJson("/api/console/team/remind", { invoice: number });
    setBusy(false);
    toast(data.message || shell.failed);
  }
  return (
    <button className={`btn${solid ? " btn--solid" : " btn--sm"}`} type="button" onClick={send} disabled={busy}>
      {invoiceCopy.remind}
    </button>
  );
}

export function ReceiptActions({ number, canRefund, what }) {
  const router = useRouter();
  const r = receiptCopy.refund;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(r.reasons[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function email() {
    setBusy(true);
    const { data } = await postJson(`/api/console/receipts/${number}`, { action: "email" });
    setBusy(false);
    toast(data.message || shell.failed);
  }

  async function refund(e) {
    e.preventDefault();
    setBusy(true);
    const { data } = await postJson(`/api/console/receipts/${number}`, { action: "refund", reason, details });
    setBusy(false);
    if (!data.ok) return setError(data.message || shell.failed);
    setOpen(false);
    toast(data.message);
    router.refresh();
  }

  return (
    <>
      <button className="btn" type="button" onClick={email} disabled={busy}>
        <Icon name="mail" />
        {receiptCopy.email}
      </button>
      {canRefund && (
        <button className="btn" type="button" onClick={() => setOpen(true)}>
          {r.button}
        </button>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} title={r.title}>
        <form onSubmit={refund} noValidate>
          <p>{what}</p>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="rf-why">{r.why}</label>
            <select id="rf-why" value={reason} onChange={(e) => setReason(e.target.value)}>
              {r.reasons.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rf-more">{r.more}</label>
            <textarea id="rf-more" value={details} maxLength={2000} placeholder={r.morePlaceholder} onChange={(e) => setDetails(e.target.value)} />
          </div>
          <p className="note" style={{ marginTop: 10 }}>
            {r.note}
          </p>
          <p className="field__err" role="alert">
            {error}
          </p>
          <div className="btns" style={{ marginTop: 14 }}>
            <button className="btn btn--solid" type="submit" disabled={busy}>
              {r.send}
            </button>
            <button className="btn" type="button" onClick={() => setOpen(false)}>
              {r.cancel}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
