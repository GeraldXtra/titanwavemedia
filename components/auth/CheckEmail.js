"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInMark } from "./Parts";
import { postJson, recallLink, rememberLink } from "@/lib/client";
import { format } from "@/lib/text";
import copy from "@/content/console/signin";

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function CheckEmail() {
  const t = copy.check;
  const [email, setEmail] = useState("");
  const [next, setNext] = useState(0);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = recallLink();
    setEmail(saved.email || "");
    setNext(saved.next || 0);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = Math.max(0, Math.ceil((next - now) / 1000));

  async function resend() {
    setBusy(true);
    setMessage("");
    const { data } = await postJson("/api/auth/link", { email, intent: "signin" });
    setBusy(false);
    if (data.ok) {
      rememberLink(email, data.seconds);
      setNext(Date.now() + (data.seconds || 60) * 1000);
      setMessage(t.resent);
    } else {
      if (data.seconds) setNext(Date.now() + data.seconds * 1000);
      setMessage(data.message || copy.errors.failed);
    }
  }

  return (
    <>
      <SignInMark icon="mail" />
      <h1>{t.title}</h1>
      <p className="si__sent">
        {email ? (
          <>
            {t.lede.split("{email}")[0]}
            <b>{email}</b>
            {t.lede.split("{email}")[1]}
          </>
        ) : (
          t.ledeNoEmail
        )}
      </p>
      <p className="si__help">{t.spam}</p>
      <div className="si__actions">
        {email && (
          <button className="btn si__btn" type="button" onClick={resend} disabled={busy || left > 0} aria-busy={busy || undefined}>
            {left > 0 ? format(t.resendIn, { time: clock(left) }) : t.resend}
          </button>
        )}
        <Link className="si__textlink" href="/signin">
          {t.other}
        </Link>
      </div>
      <p className="si__notice" role="status" style={{ marginTop: 16, display: message ? undefined : "none" }}>
        {message}
      </p>
    </>
  );
}
