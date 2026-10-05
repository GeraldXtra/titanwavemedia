"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postJson, rememberLink } from "@/lib/client";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/signin";

const FIELDS = ["name", "business", "email", "terms"];

// Create your account: name, business name and email, then the same sign in link.
export default function SignUpForm({ email: initial = "" }) {
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
      <h1>{t.title}</h1>
      <p className="lede">{t.lede}</p>
      <form onSubmit={submit} noValidate>
        {field("name", copy.fields.name, { autoComplete: "name", maxLength: 120 })}
        {field("business", copy.fields.business, { autoComplete: "organization", maxLength: 120 })}
        {field("email", copy.fields.email, { type: "email", autoComplete: "email", inputMode: "email", placeholder: copy.fields.emailPlaceholder })}
        <label className="check">
          <input id="su-terms" type="checkbox" checked={v.terms} onChange={set("terms")} aria-invalid={errors.terms ? "true" : undefined} aria-describedby={errors.terms ? "su-terms-err" : undefined} />
          <span>
            {t.termsBefore}
            <a className="link" href="/terms" target="_blank" rel="noopener">
              {t.terms}
            </a>
            {t.termsMiddle}
            <a className="link" href="/privacy-policy" target="_blank" rel="noopener">
              {t.privacy}
            </a>
          </span>
        </label>
        <p className="field__err" id="su-terms-err">
          {errors.terms}
        </p>
        <button className="btn btn--solid btn--block" type="submit" disabled={busy}>
          {busy ? copy.signin.sending : t.button}
        </button>
        <p className="auth__err" role="alert">
          {formError}
        </p>
      </form>
      <p className="auth__foot">
        {t.foot} <Link className="link" href="/signin">{t.footLink}</Link>
      </p>
    </>
  );
}
