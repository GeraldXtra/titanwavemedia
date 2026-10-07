"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "../Icon";
import Dialog from "./Dialog";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/pay";

const METHODS = ["card", "bank_transfer", "ussd"];

let paystackLoad = null;
function loadPaystack() {
  if (!paystackLoad) {
    paystackLoad = new Promise((resolve, reject) => {
      if (window.PaystackPop) return resolve(window.PaystackPop);
      const s = document.createElement("script");
      s.src = "https://js.paystack.co/v2/inline.js";
      s.async = true;
      s.onload = () => resolve(window.PaystackPop);
      s.onerror = () => {
        paystackLoad = null;
        reject(new Error("paystack"));
      };
      document.head.appendChild(s);
    });
  }
  return paystackLoad;
}
let popup = null;

export default function PayWindow({ invoice, cards = [], testMode = false, open: openFirst = false, label }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState((cards.find((c) => c.isDefault) || cards[0] || { id: "new" }).id);
  const [step, setStep] = useState("method");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const opened = useRef(false);

  useEffect(() => {
    if (openFirst && !opened.current) {
      opened.current = true;
      setOpen(true);
    }
  }, [openFirst]);

  function close() {
    setOpen(false);
    if (step === "ok" || step === "pending") router.refresh();
    setStep("method");
    setNotice("");
  }

  async function check(reference, { cancelled = false } = {}) {
    setStep("checking");
    const { data } = await postJson("/api/pay/verify", { reference });
    if (data.status === "success") {
      setResult({ ...data, reference });
      setStep("ok");
      return;
    }
    if (data.status === "failed") return setStep("fail");
    if (cancelled && method !== "bank_transfer") {
      setNotice(copy.cancelled);
      return setStep("method");
    }
    setStep("pending");
  }

  async function pay() {
    setBusy(true);
    setNotice("");
    const useSaved = method === "card" && card !== "new";
    const { data } = await postJson("/api/pay/start", { invoice: invoice.number, method: useSaved ? "saved_card" : method, card: useSaved ? card : undefined });
    setBusy(false);
    if (!data.ok) {
      setNotice(data.message || copy.failed);
      return;
    }
    if (useSaved) {
      if (data.status === "failed") return setStep("fail");
      return check(data.reference);
    }
    try {
      const Pop = await loadPaystack();
      if (!popup) popup = new Pop();
      setStep("waiting");
      popup.resumeTransaction(data.accessCode, {
        onSuccess: (t) => check((t && t.reference) || data.reference),
        onCancel: () => check(data.reference, { cancelled: true }),
        onError: () => {
          setNotice(copy.failed);
          setStep("method");
        },
      });
    } catch {
      setNotice(copy.failed);
      setStep("method");
    }
  }

  async function saveCard() {
    setBusy(true);
    const { data } = await postJson("/api/console/cards", { action: "save", reference: result.reference });
    setBusy(false);
    setResult({ ...result, canSave: false });
    toast(data.ok ? data.message : copy.failed);
  }

  const t = copy[method];
  return (
    <>
      <button className="btn btn--solid" type="button" onClick={() => setOpen(true)}>
        {label || format(copy.card.button, { amount: invoice.amount })}
      </button>
      <Dialog open={open && step !== "waiting"} onClose={close} title={copy.title} labelId="pay-title">
        <div className="c-pay" style={{ margin: "-16px" }}>
          {testMode && <p className="c-test">{copy.test}</p>}
          <div className="c-pay__amt">
            <small>
              {invoice.number}, {invoice.title}
            </small>
            <b>{invoice.amount}</b>
            <small>{copy.to}</small>
          </div>
          <div className="c-pay__body">
            {step === "method" && (
              <>
                <div className="c-tabs" role="tablist" aria-label={copy.tabsLabel}>
                  {METHODS.map((m) => (
                    <button key={m} type="button" role="tab" aria-selected={method === m ? "true" : "false"} onClick={() => setMethod(m)}>
                      {copy.tabs[m]}
                    </button>
                  ))}
                </div>
                <div role="tabpanel" aria-label={copy.tabs[method]}>
                  {method === "card" && cards.length > 0 && (
                    <fieldset className="c-methods" style={{ border: 0, padding: 0 }}>
                      <legend className="sr-only">{copy.card.saved}</legend>
                      {cards.map((c) => (
                        <label key={c.id}>
                          <input type="radio" name="pay-card" value={c.id} checked={card === c.id} onChange={() => setCard(c.id)} />
                          <span className="c-cardlogo" aria-hidden="true">
                            {c.brand}
                          </span>
                          {c.label}
                        </label>
                      ))}
                      <label>
                        <input type="radio" name="pay-card" value="new" checked={card === "new"} onChange={() => setCard("new")} />
                        {copy.card.newCard}
                      </label>
                    </fieldset>
                  )}
                  <p>{t.text}</p>
                  {notice && (
                    <p className="field__err" role="alert" style={{ marginTop: 10 }}>
                      {notice}
                    </p>
                  )}
                  <button className="btn btn--solid btn--block" type="button" style={{ marginTop: 14 }} onClick={pay} disabled={busy}>
                    {format(t.button, { amount: invoice.amount })}
                  </button>
                </div>
              </>
            )}
            {(step === "waiting" || step === "checking") && (
              <div className="center" role="status">
                <div className="spin" aria-hidden="true" />
                <p>
                  <b>{step === "waiting" ? copy.waitingTitle : copy.checkingTitle}</b>
                </p>
                <p className="note">{step === "waiting" ? copy.waitingText : copy.checkingText}</p>
              </div>
            )}
            {step === "ok" && result && (
              <div className="center" role="status">
                <div className="c-done" aria-hidden="true">
                  <Icon name="check" />
                </div>
                <p style={{ fontSize: 20 }}>
                  <b>{copy.okTitle}</b>
                </p>
                <p className="note" style={{ marginTop: 4 }}>
                  {format(copy.okText, { amount: result.amount, method: result.method, number: result.receipt })}
                </p>
                {result.canSave ? (
                  <div className="c-card" style={{ marginTop: 14, textAlign: "left" }}>
                    <h3>{copy.save.title}</h3>
                    <p style={{ marginTop: 6 }}>{copy.save.text}</p>
                    <div className="btns" style={{ marginTop: 12 }}>
                      <button className="btn btn--solid" type="button" onClick={saveCard} disabled={busy}>
                        {copy.save.yes}
                      </button>
                      <button className="btn" type="button" onClick={() => setResult({ ...result, canSave: false })}>
                        {copy.save.no}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="btns" style={{ marginTop: 16, justifyContent: "center" }}>
                    <Link className="btn" href={`/console/receipts/${result.receipt}`} onClick={() => setOpen(false)}>
                      {copy.receipt}
                    </Link>
                    <button className="btn" type="button" onClick={close}>
                      {copy.done}
                    </button>
                  </div>
                )}
              </div>
            )}
            {step === "fail" && (
              <div className="center" role="alert">
                <div className="c-done c-done--fail" aria-hidden="true">
                  <Icon name="close" />
                </div>
                <p style={{ fontSize: 20 }}>
                  <b>{copy.failTitle}</b>
                </p>
                <p className="note" style={{ marginTop: 4 }}>
                  {copy.failText}
                </p>
                <div className="btns" style={{ marginTop: 16, justifyContent: "center" }}>
                  <button className="btn btn--solid" type="button" onClick={() => setStep("method")}>
                    {copy.tryCard}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setMethod("bank_transfer");
                      setStep("method");
                    }}
                  >
                    {copy.tryBank}
                  </button>
                </div>
              </div>
            )}
            {step === "pending" && (
              <div className="center" role="status">
                <p style={{ fontSize: 20 }}>
                  <b>{copy.pendingTitle}</b>
                </p>
                <p className="note" style={{ marginTop: 6 }}>
                  {copy.pendingText}
                </p>
                <div className="btns" style={{ marginTop: 16, justifyContent: "center" }}>
                  <button className="btn" type="button" onClick={close}>
                    {copy.done}
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="c-pay__foot">
            <Icon name="lock" />
            <span>{copy.foot}</span>
          </p>
        </div>
      </Dialog>
    </>
  );
}
