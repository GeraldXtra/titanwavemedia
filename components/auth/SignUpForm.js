"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GOOGLE } from "./SignInForm";
import { SignInMark, TermsLine } from "./Parts";
import { postJson, rememberLink } from "@/lib/client";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/signin";

const FIELDS = ["name", "business", "email", "terms"];

export default function SignUpForm({ email: initial = "", google = false, notice = null }) {
  const router = useRouter();
  const t = copy.signup;
  const [v, setV] = useState({ name: "", business: "", email: initial, terms: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: k === "terms" ? e.target.checked : e.target.value });

  function check() {
    const out = {};
    if (!v.name.trim()) out.name = copy.errors.name;
    if (!v.business.trim()) out.business = copy.errors.business;
    if (!v.email.trim()) out.email = copy.errors.email;
    else if (!isEmail(v.email)) out.email = copy.errors.emailFormat;
    if (!v.terms) out.terms = copy.errors.terms;
    return out;
  }

  async function submit(e) {
    e.preventDefault();
    const found = check();
    setErrors(found);
    setFormError("");
    const first = FIELDS.find((k) => found[k]);
    if (first) {
      document.getElementById(`su-${first}`).focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/auth/link", { intent: "signup", name: v.name.trim(), business: v.business.trim(), email: v.email.trim(), terms: v.terms });
    setBusy(false);
    if (data.ok) {
      rememberLink(v.email.trim(), data.seconds);
      router.push("/signin/check");
      return;
    }
    if (data.errors) setErrors(data.errors);
    else setFormError(data.message || copy.errors.failed);
  }

  const field = (k, label, props) => (
    <div className="field" data-err={errors[k] ? "" : undefined}>
      <label htmlFor={`su-${k}`}>{label}</label>
      <input id={`su-${k}`} value={v[k]} onChange={set(k)} aria-invalid={errors[k] ? "true" : undefined} aria-describedby={errors[k] ? `su-${k}-err` : undefined} {...props} />
      <p className="field__err" id={`su-${k}-err`}>
        {errors[k]}
      </p>
    </div>
  );

  return (
    <>
      <SignInMark />
      {notice && (
        <p className="si__notice" role="status">
          {notice}
        </p>
      )}
      <h1>{t.title}</h1>
      <p className="si__sub">
        {t.foot} <Link href="/signin">{t.footLink}</Link>
      </p>
      <form className="si__form" onSubmit={submit} noValidate>
        {google && (
          <>
            <a className="btn si__btn" href="/auth/google">
              {GOOGLE}
              {t.google}
            </a>
            <p className="si__or" aria-hidden="true">
              {copy.signin.or}
            </p>
          </>
        )}
        {field("name", copy.fields.name, { autoComplete: "name", maxLength: 120, placeholder: copy.fields.namePlaceholder })}
        {field("business", copy.fields.business, { autoComplete: "organization", maxLength: 120, placeholder: copy.fields.businessPlaceholder })}
        {field("email", copy.fields.email, { type: "email", autoComplete: "email", inputMode: "email", placeholder: copy.fields.emailPlaceholder })}
        <label className="si__agree">
          <input id="su-terms" type="checkbox" checked={v.terms} onChange={set("terms")} aria-invalid={errors.terms ? "true" : undefined} aria-describedby={errors.terms ? "su-terms-err" : undefined} />
          <span>
            {t.termsBefore}
            <a href="/terms" target="_blank" rel="noopener">
              {t.terms}
            </a>
            {t.termsMiddle}
            <a href="/privacy-policy" target="_blank" rel="noopener">
              {t.privacy}
            </a>
          </span>
        </label>
        <p className="field__err si__agree-err" id="su-terms-err">
          {errors.terms}
        </p>
        <button className="btn btn--solid si__btn" type="submit" disabled={busy}>
          {busy ? copy.signin.sending : t.button}
        </button>
        <p className="si__err" role="alert">
          {formError}
        </p>
        <p className="si__help">{t.help}</p>
      </form>
      {google && <TermsLine t={t.googleTerms} />}
    </>
  );
}
