"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/team-clients";

const FIELDS = ["business", "name", "email"];

export default function InviteClient() {
  const router = useRouter();
  const t = copy.invite;
  const [v, setV] = useState({ business: "", name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [sending, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const busy = sending || pending;

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!v.business.trim()) found.business = t.errors.business;
    if (!v.name.trim()) found.name = t.errors.name;
    if (!isEmail(v.email.trim())) found.email = t.errors.email;
    setErrors(found);
    const bad = FIELDS.find((k) => found[k]);
    if (bad) return document.getElementById(`ic-${bad}`).focus();
    setBusy(true);
    const { data } = await postJson("/api/console/team/clients", { business: v.business.trim(), name: v.name.trim(), email: v.email.trim() });
    setBusy(false);
    if (!data.ok) return setErrors({ [data.field || "form"]: data.message || t.errors.failed });
    setV({ business: "", name: "", email: "" });
    toast(data.message);
    startTransition(() => router.refresh());
  }

  return (
    <form className="c-card" onSubmit={submit} noValidate style={{ maxWidth: 820 }}>
      <h2>{t.title}</h2>
      <p style={{ marginTop: 6 }}>{t.text}</p>
      <div className="c-grid" style={{ marginTop: 12 }}>
        {FIELDS.map((k) => (
          <div className="field" key={k} style={{ marginTop: 0 }} data-err={errors[k] ? "" : undefined}>
            <label htmlFor={`ic-${k}`}>{t[k]}</label>
            <input
              id={`ic-${k}`}
              type={k === "email" ? "email" : "text"}
              autoComplete="off"
              value={v[k]}
              maxLength={k === "email" ? 254 : 120}
              onChange={(e) => setV({ ...v, [k]: e.target.value })}
              aria-invalid={errors[k] ? "true" : undefined}
              aria-describedby={`ic-${k}-err`}
            />
            <p className="field__err" id={`ic-${k}-err`}>
              {errors[k]}
            </p>
          </div>
        ))}
      </div>
      <p className="field__err" role="alert">
        {errors.form}
      </p>
      <div className="btns" style={{ marginTop: 12 }}>
        <button className="btn btn--solid" type="submit" disabled={busy} aria-busy={busy || undefined}>
          {t.button}
        </button>
      </div>
    </form>
  );
}
