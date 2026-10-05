"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import CodeBoxes from "./CodeBoxes";
import { postJson } from "@/lib/client";
import copy from "@/content/console/signin";

// "Enter your code": the 6 digits from an authenticator app, or a backup code.
export default function CodeForm() {
  const t = copy.code;
  const [code, setCode] = useState("");
  const [backupMode, setBackupMode] = useState(false);
  const [backup, setBackup] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);

  useEffect(() => {
    const first = document.getElementById(backupMode ? "backup-in" : "code-0");
    if (first) first.focus();
  }, [backupMode]);

  async function send(value) {
    if (sending.current) return;
    if (backupMode ? value.replace(/[^a-z0-9]/gi, "").length !== 8 : value.length !== 6) {
      setError(backupMode ? copy.errors.backupLength : copy.errors.codeLength);
      return;
    }
    sending.current = true;
    setBusy(true);
    setError("");
    const { data } = await postJson("/api/auth/code", backupMode ? { backup: value } : { code: value });
    if (data.ok && data.next) {
      window.location.replace(data.next);
      return;
    }
    sending.current = false;
    setBusy(false);
    if (data.next) {
      window.location.replace(data.next);
      return;
    }
    setError(data.message || copy.errors.failed);
    if (!backupMode) setCode("");
  }

  function submit(e) {
    e.preventDefault();
    send(backupMode ? backup : code);
  }

  return (
    <>
      <div className="auth__icon">
        <Icon name="lock" />
      </div>
      <h1>{t.title}</h1>
      <p className="lede">{t.lede}</p>
      <form onSubmit={submit} noValidate>
        {backupMode ? (
          <div className="field" data-err={error ? "" : undefined}>
            <label htmlFor="backup-in">{t.backupLabel}</label>
            <input
              id="backup-in"
              value={backup}
              onChange={(e) => setBackup(e.target.value)}
              placeholder={t.backupPlaceholder}
              autoComplete="one-time-code"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={error ? "true" : undefined}
              aria-describedby="code-err backup-note"
            />
            <p className="note" id="backup-note">
              {t.backupNote}
            </p>
          </div>
        ) : (
          <CodeBoxes value={code} onChange={setCode} onFull={send} legend={t.group} digitLabel={t.digit} invalid={Boolean(error)} describedBy="code-err" />
        )}
        <p className="auth__err" id="code-err" role="alert">
          {error}
        </p>
        <button className="btn btn--solid btn--block" type="submit" disabled={busy}>
          {busy ? copy.verify.code : t.button}
        </button>
      </form>
      <p className="auth__foot">
        <button
          className="linkbtn"
          type="button"
          onClick={() => {
            setError("");
            setBackupMode(!backupMode);
          }}
        >
          {backupMode ? t.useApp : t.useBackup}
        </button>
      </p>
      <form className="auth__foot" action="/auth/signout" method="post">
        <button className="linkbtn" type="submit">
          {t.signOut}
        </button>
      </form>
    </>
  );
}
