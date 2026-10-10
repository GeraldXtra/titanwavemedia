"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Dialog from "../Dialog";
import { postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import copy from "@/content/console/settings";

const t = copy.security.twostep;

export default function TwoStep({ on }) {
  const router = useRouter();
  const [win, setWin] = useState(null);
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState("");
  const [sending, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const busy = sending || pending;

  async function start() {
    setBusy(true);
    setError("");
    const { data } = await postJson("/api/console/security/start", {});
    setBusy(false);
    if (!data.ok) return toast(copy.failed);
    setSetup(data);
    setCode("");
    setWin("setup");
  }

  async function confirm(e) {
    e.preventDefault();
    if (code.replace(/\D/g, "").length !== 6) return setError(t.codeLength);
    setBusy(true);
    const { data } = await postJson("/api/console/security/confirm", { factorId: setup.factorId, code });
    setBusy(false);
    if (!data.ok) return setError(data.message || copy.failed);
    setCodes(data.codes);
    setWin("codes");
    toast(t.turnedOn);
  }

  async function newCodes() {
    setBusy(true);
    const { data } = await postJson("/api/console/security/codes", {});
    setBusy(false);
    if (!data.ok) return toast(copy.failed);
    setCodes(data.codes);
    setWin("codes");
  }

  async function turnOff() {
    setBusy(true);
    const { data } = await postJson("/api/console/security/off", {});
    setBusy(false);
    setWin(null);
    if (!data.ok) return toast(copy.failed);
    toast(t.turnedOff);
    startTransition(() => router.refresh());
  }

  function closeCodes() {
    setWin(null);
    setCodes([]);
    startTransition(() => router.refresh());
  }

  return (
    <div className="c-card">
      <h2>{t.title}</h2>
      <div className="c-toggle">
        <span className="c-toggle__text">
          <b id="ts-label">{t.label}</b>
          <small id="ts-help">{t.help}</small>
        </span>
        <label className="switch">
          <input
            type="checkbox"
            role="switch"
            checked={on}
            disabled={busy}
            aria-busy={busy || undefined}
            aria-labelledby="ts-label"
            aria-describedby="ts-help ts-state"
            onChange={() => (on ? setWin("off") : start())}
          />
          <span className="switch__track" aria-hidden="true" />
        </label>
      </div>
      <p className="note" id="ts-state" style={{ marginTop: 10 }}>
        {on ? t.on : t.off}
      </p>
      {on && (
        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn btn--sm" type="button" onClick={() => setWin("new")}>
            {t.newCodes}
          </button>
        </div>
      )}

      <Dialog open={win === "setup"} onClose={() => setWin(null)} title={t.setupTitle}>
        {setup && (
          <form onSubmit={confirm} noValidate>
            <p>{t.step1}</p>
            <img className="c-qr" src={setup.qr} alt={t.qrAlt} width={180} height={180} />
            <p className="note">{t.key}</p>
            <p className="c-secret">{setup.secret}</p>
            <div className="field" style={{ marginTop: 16 }} data-err={error ? "" : undefined}>
              <label htmlFor="ts-code">{t.step2}</label>
              <input
                id="ts-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                aria-invalid={error ? "true" : undefined}
                aria-describedby="ts-code-err"
                style={{ maxWidth: 200, fontSize: 20, letterSpacing: ".2em" }}
              />
              <p className="field__err" id="ts-code-err">
                {error}
              </p>
            </div>
            <div className="btns" style={{ marginTop: 14 }}>
              <button className="btn btn--solid" type="submit" disabled={busy} aria-busy={busy || undefined}>
                {t.confirm}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={win === "codes"} onClose={closeCodes} title={t.codesTitle}>
        <p>{t.codesText}</p>
        <ul className="c-codes">
          {codes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="note">{t.codesWarn}</p>
        <div className="btns" style={{ marginTop: 14 }}>
          <button
            className="btn"
            type="button"
            onClick={() => {
              navigator.clipboard && navigator.clipboard.writeText(codes.join("\n")).then(() => toast(t.copied), () => {});
            }}
          >
            {t.copy}
          </button>
          <button className="btn btn--solid" type="button" onClick={closeCodes}>
            {t.done}
          </button>
        </div>
      </Dialog>

      <Dialog open={win === "new"} onClose={() => setWin(null)} title={t.newCodes}>
        <p>{t.newCodesText}</p>
        <div className="btns" style={{ marginTop: 14 }}>
          <button className="btn btn--solid" type="button" onClick={newCodes} disabled={busy} aria-busy={busy || undefined}>
            {t.newCodes}
          </button>
          <button className="btn" type="button" onClick={() => setWin(null)}>
            {t.cancelNew}
          </button>
        </div>
      </Dialog>

      <Dialog open={win === "off"} onClose={() => setWin(null)} title={t.offTitle}>
        <p>{t.offText}</p>
        <div className="btns" style={{ marginTop: 14 }}>
          <button className="btn btn--danger" type="button" onClick={turnOff} disabled={busy} aria-busy={busy || undefined}>
            {t.offButton}
          </button>
          <button className="btn" type="button" onClick={() => setWin(null)}>
            {t.cancel}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
