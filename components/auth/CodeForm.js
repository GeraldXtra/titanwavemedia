"use client";

import { useEffect, useRef, useState } from "react";
import CodeBoxes from "./CodeBoxes";
import { SignInMark } from "./Parts";
import { navStart, postJson } from "@/lib/client";
import copy from "@/content/console/signin";

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
      navStart();
      window.location.replace(data.next);
      return;
    }
    if (data.next) {
      navStart();
      window.location.replace(data.next);
      return;
    }
    sending.current = false;
    setBusy(false);
    setError(data.message || copy.errors.failed);
    if (!backupMode) setCode("");
  }

  function submit(e) {
    e.preventDefault();
    send(backupMode ? backup : code);
  }

  return (
    <>
      <SignInMark icon="lock" />
      <h1>{t.title}</h1>
      <p className="si__sub">{t.lede}</p>
      <form className="si__form" onSubmit={submit} noValidate>
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
        <p className="si__err" id="code-err" role="alert">
          {error}
        </p>
        <button className="btn btn--solid si__btn" type="submit" disabled={busy} aria-busy={busy || undefined}>
          {busy ? copy.verify.code : t.button}
        </button>
      </form>
      <p className="si__links">
        <button
          className="si__textlink"
          type="button"
          onClick={() => {
            setError("");
            setBackupMode(!backupMode);
          }}
        >
          {backupMode ? t.useApp : t.useBackup}
        </button>
      </p>
      <form className="si__links" action="/auth/signout" method="post">
        <button className="si__textlink" type="submit">
          {t.signOut}
        </button>
      </form>
    </>
  );
}
