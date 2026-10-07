"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "../Icon";
import Rich from "../Rich";
import { Year } from "../Live";
import Dialog from "./Dialog";
import { postJson } from "@/lib/client";
import { remembering, setRemembering } from "@/lib/choices";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import { waLink } from "@/lib/whatsapp";
import site from "@/content/site";
import shell from "@/content/console/shell";

const f = shell.footer;
const TABS = ["privacy", "terms", "refunds", "cookies"];

export default function ConsoleFooter({ legal }) {
  const pathname = usePathname();
  const [status, setStatus] = useState(null);
  const [win, setWin] = useState(null);
  const [tab, setTab] = useState("privacy");

  useEffect(() => {
    let alive = true;
    fetch("/api/console/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => alive && setStatus(d))
      .catch(() => alive && setStatus({ ok: false, checks: {} }));
    return () => {
      alive = false;
    };
  }, []);

  function openLegal(which) {
    setTab(which);
    setWin("legal");
  }

  return (
    <>
      <footer className="c-foot" aria-label={f.label}>
        <div className="c-foot__group">
          <button type="button" className="c-foot__btn" onClick={() => setWin("feedback")}>
            <Icon name="chat" />
            {f.feedback}
          </button>
          <a className="c-foot__btn" href={waLink(site.whatsappUrl, f.whatsappText)} target="_blank" rel="noopener">
            <Icon name="wa" />
            {f.whatsapp}
          </a>
          <button type="button" className="c-foot__btn" onClick={() => setWin("status")}>
            <span className={`c-dot${status && !status.ok ? " c-dot--bad" : ""}`} aria-hidden="true" />
            {!status ? f.checking : status.ok ? f.ok : f.bad}
          </button>
        </div>
        <div className="c-foot__group">
          <span>
            <Rich text={f.copyright} tokens={{ year: <Year initial={new Date().getFullYear()} /> }} />
          </span>
          {TABS.map((t) => (
            <button key={t} type="button" className="c-foot__btn c-foot__link" onClick={() => openLegal(t)}>
              {f[t]}
            </button>
          ))}
        </div>
      </footer>

      <Dialog open={win === "legal"} onClose={() => setWin(null)} title={shell.legal.title} sub={format(shell.legal.updated, { updated: legal.updated })} wide>
        <LegalTabs tab={tab} setTab={setTab} legal={legal} onSaved={() => setWin(null)} />
      </Dialog>

      <Dialog open={win === "feedback"} onClose={() => setWin(null)} title={shell.feedback.title}>
        <FeedbackForm page={pathname} onDone={() => setWin(null)} />
      </Dialog>

      <Dialog open={win === "status"} onClose={() => setWin(null)} title={shell.status.title} sub={status && status.checkedAt ? format(shell.status.checked, { time: status.checkedAt }) : null}>
        <ul className="c-list">
          {Object.keys(shell.status.checks).map((k) => {
            const ok = status && status.checks && status.checks[k];
            return (
              <li key={k}>
                <Icon name={k === "payments" ? "card" : "lock"} />
                <span>{shell.status.checks[k]}</span>
                <span className={`c-chip ${ok ? "c-chip--ok" : "c-chip--danger"} c-list__end`}>{ok ? shell.status.working : shell.status.notWorking}</span>
              </li>
            );
          })}
        </ul>
        <p className="note" style={{ marginTop: 12 }}>
          {shell.status.note}
        </p>
      </Dialog>
    </>
  );
}

function LegalTabs({ tab, setTab, legal, onSaved }) {
  const t = shell.legal;
  const [remember, setRemember] = useState(false);
  useEffect(() => setRemember(remembering()), []);

  function onKey(e) {
    const i = TABS.indexOf(tab);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const next = TABS[(i + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length];
      setTab(next);
      setTimeout(() => document.getElementById(`lg-${next}-tab`)?.focus(), 0);
    }
  }

  return (
    <>
      <div className="c-tabs" role="tablist" aria-label={t.title} onKeyDown={onKey}>
        {TABS.map((k) => (
          <button
            key={k}
            id={`lg-${k}-tab`}
            type="button"
            role="tab"
            aria-selected={tab === k ? "true" : "false"}
            aria-controls={`lg-${k}`}
            tabIndex={tab === k ? 0 : -1}
            onClick={() => setTab(k)}
          >
            {t.tabs[k]}
          </button>
        ))}
      </div>
      {["privacy", "terms", "refunds"].map((k) => (
        <div key={k} id={`lg-${k}`} role="tabpanel" aria-labelledby={`lg-${k}-tab`} hidden={tab !== k} tabIndex={0}>
          {legal[k]}
        </div>
      ))}
      <div id="lg-cookies" role="tabpanel" aria-labelledby="lg-cookies-tab" hidden={tab !== "cookies"}>
        <p style={{ marginTop: 16 }}>{t.cookiesText}</p>
        <div className="c-toggle">
          <span className="c-toggle__text">
            <b>{t.needed}</b>
            <small id="ck-needed-help">{t.neededHelp}</small>
          </span>
          <label className="switch">
            <input type="checkbox" role="switch" checked disabled aria-label={t.needed} aria-describedby="ck-needed-help" />
            <span className="switch__track" aria-hidden="true" />
          </label>
        </div>
        <div className="c-toggle">
          <span className="c-toggle__text">
            <b>{t.remember}</b>
            <small id="ck-remember-help">{t.rememberHelp}</small>
          </span>
          <label className="switch">
            <input type="checkbox" role="switch" checked={remember} onChange={(e) => setRemember(e.target.checked)} aria-label={t.remember} aria-describedby="ck-remember-help" />
            <span className="switch__track" aria-hidden="true" />
          </label>
        </div>
        <div className="btns" style={{ marginTop: 14 }}>
          <button
            className="btn btn--solid"
            type="button"
            onClick={() => {
              setRemembering(remember);
              toast(t.saved);
              onSaved();
            }}
          >
            {t.save}
          </button>
        </div>
      </div>
    </>
  );
}

function FeedbackForm({ page, onDone }) {
  const t = shell.feedback;
  const [kind, setKind] = useState(t.kinds[0]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (text.trim().length < 3) {
      setError(t.short);
      document.getElementById("fb-text").focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/feedback", { kind, message: text.trim(), page });
    setBusy(false);
    if (!data.ok) {
      setError(shell.failed);
      return;
    }
    toast(t.thanks);
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate>
      <p>{t.text}</p>
      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="fb-kind">{t.kind}</label>
        <select id="fb-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          {t.kinds.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>
      <div className="field" data-err={error ? "" : undefined}>
        <label htmlFor="fb-text">{t.message}</label>
        <textarea id="fb-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} aria-invalid={error ? "true" : undefined} aria-describedby="fb-err" />
        <p className="field__err" id="fb-err">
          {error}
        </p>
      </div>
      <div className="btns" style={{ marginTop: 14 }}>
        <button className="btn btn--solid" type="submit" disabled={busy}>
          {t.send}
        </button>
        <button className="btn" type="button" onClick={onDone}>
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
