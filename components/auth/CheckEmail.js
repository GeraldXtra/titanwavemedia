"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { postJson, recallLink, rememberLink } from "@/lib/client";
import { format } from "@/lib/text";
import copy from "@/content/console/signin";

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// "Check your email", with "Send it again" once a minute has passed.
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
      <div className="auth__icon">
        <Icon name="mail" />
      </div>
      <h1>{t.title}</h1>
      <p className="lede">{email ? format(t.lede, { email }) : t.ledeNoEmail}</p>
      <ul className="auth__list">
        <li>
          <Icon name="search" />
          <span>{t.spam}</span>
        </li>
        {email && (
          <li>
            <Icon name="mail" />
            <span>
              <button className="linkbtn" type="button" onClick={resend} disabled={busy || left > 0}>
                {t.resend}
              </button>
              {left > 0 && <span className="note"> {format(t.resendIn, { time: clock(left) })}</span>}
            </span>
          </li>
        )}
        <li>
          <Icon name="out" />
          <span>
            <Link className="link" href="/signin">
              {t.other}
            </Link>
          </span>
        </li>
      </ul>
      <p className="auth__notice" role="status" style={{ marginTop: 16, display: message ? undefined : "none" }}>
        {message}
      </p>
    </>
  );
}
