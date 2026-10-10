"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInMark, TermsLine } from "./Parts";
import { navStart, postJson, rememberLink } from "@/lib/client";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/signin";

export const GOOGLE = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.2z" />
    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1a6.6 6.6 0 0 1-6.2-4.6H2.1v2.9A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.8 14a6.6 6.6 0 0 1 0-4.2V6.9H2.1a11 11 0 0 0 0 9.9z" />
    <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2A11 11 0 0 0 2.1 6.9l3.7 2.9A6.6 6.6 0 0 1 12 5.4z" />
  </svg>
);

export default function SignInForm({ google = false, notice: firstNotice = null, email: initial = "", heading = true, button = copy.signin.button, fromAddress = false }) {
  const router = useRouter();
  const t = copy.signin;
  const [email, setEmail] = useState(initial);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(firstNotice);

  useEffect(() => {
    router.prefetch("/signin/check");
    if (!fromAddress) return;
    const sp = new URLSearchParams(window.location.search);
    const found = sp.get("deleted") ? t.deleted : sp.get("signed_out") ? t.signedOut : sp.get("error") === "google" ? t.googleFailed : null;
    if (found) setNotice(found);
    const given = sp.get("email");
    if (given && isEmail(given)) setEmail(given);
  }, [fromAddress, router, t]);

  async function submit(e) {
    e.preventDefault();
    const value = email.trim();
    const problem = !value ? copy.errors.email : !isEmail(value) ? copy.errors.emailFormat : "";
    setError(problem);
    setFormError("");
    if (problem) {
      document.getElementById("si-email").focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/auth/link", { email: value, intent: "signin" });
    if (data.ok) {
      rememberLink(value, data.seconds);
      navStart();
      router.push("/signin/check");
      return;
    }
    setBusy(false);
    if (data.errors && data.errors.email) setError(data.errors.email);
    else setFormError(data.message || copy.errors.failed);
  }

  return (
    <>
      {heading && (
        <>
          <SignInMark />
          {notice && (
            <p className="si__notice" role="status">
              {notice}
            </p>
          )}
          <h1>{t.title}</h1>
          <p className="si__sub">
            {t.foot} <Link href="/signup">{t.footLink}</Link>
          </p>
        </>
      )}
      <form className="si__form" onSubmit={submit} noValidate>
        {google && (
          <>
            <a className="btn si__btn" href="/auth/google">
              {GOOGLE}
              {t.google}
            </a>
            <p className="si__or" aria-hidden="true">
              {t.or}
            </p>
          </>
        )}
        <div className="field" data-err={error ? "" : undefined}>
          <label htmlFor="si-email">{copy.fields.email}</label>
          <input
            id="si-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={copy.fields.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "si-err" : undefined}
          />
          <p className="field__err" id="si-err">
            {error}
          </p>
        </div>
        <button className="btn btn--solid si__btn" type="submit" disabled={busy} aria-busy={busy || undefined}>
          {busy ? t.sending : button}
        </button>
        <p className="si__err" role="alert">
          {formError}
        </p>
        {heading && <p className="si__help">{t.help}</p>}
      </form>
      {heading && <TermsLine t={t} />}
    </>
  );
}
