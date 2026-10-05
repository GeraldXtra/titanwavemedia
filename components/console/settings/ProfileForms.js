"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/settings";

const p = copy.profile;

// Your details: your name. The email is shown but cannot be changed here.
export function ProfileForm({ name: first, email }) {
  const router = useRouter();
  const [name, setName] = useState(first);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError(p.errors.name);
      document.getElementById("pf-name").focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/profile", { name: name.trim() });
    setBusy(false);
    if (!data.ok) return setError(data.message || copy.failed);
    setError("");
    toast(copy.saved);
    router.refresh();
  }

  return (
    <form className="c-card" onSubmit={submit} noValidate>
      <h2>{p.you}</h2>
      <div className="field" style={{ marginTop: 12 }} data-err={error ? "" : undefined}>
        <label htmlFor="pf-name">{p.name}</label>
        <input id="pf-name" value={name} maxLength={120} autoComplete="name" onChange={(e) => setName(e.target.value)} aria-invalid={error ? "true" : undefined} aria-describedby="pf-name-err" />
        <p className="field__err" id="pf-name-err">
          {error}
        </p>
      </div>
      <div className="field">
        <label htmlFor="pf-email">{p.email}</label>
        <input id="pf-email" type="email" value={email} readOnly aria-describedby="pf-email-help" />
        <p className="field__hint" id="pf-email-help">
          {p.emailHelp}
        </p>
      </div>
      <div className="btns" style={{ marginTop: 14 }}>
        <button className="btn btn--solid" type="submit" disabled={busy}>
          {p.save}
        </button>
      </div>
    </form>
  );
}

// Business details, for invoices. Only an owner can change them.
export function BusinessForm({ business, owner }) {
  const router = useRouter();
  const [v, setV] = useState(business);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!v.name.trim()) {
      setError(p.errors.business);
      document.getElementById("bz-name").focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/business", { name: v.name.trim(), phone: v.phone.trim(), address: v.address.trim() });
    setBusy(false);
    if (!data.ok) return setError(data.message || copy.failed);
    setError("");
    toast(copy.saved);
    router.refresh();
  }

  const input = (k, label, props = {}) => (
    <div className="field" data-err={k === "name" && error ? "" : undefined}>
      <label htmlFor={`bz-${k}`}>{label}</label>
      {k === "address" ? (
        <textarea id={`bz-${k}`} value={v[k]} maxLength={300} readOnly={!owner} onChange={(e) => setV({ ...v, [k]: e.target.value })} style={{ minHeight: 80 }} />
      ) : (
        <input id={`bz-${k}`} value={v[k]} readOnly={!owner} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...props} />
      )}
    </div>
  );

  return (
    <form className="c-card" onSubmit={submit} noValidate>
      <h2>{p.business}</h2>
      <p className="note">{owner ? p.businessHelp : format(p.ownerOnly, { business: business.name })}</p>
      <div style={{ marginTop: 12 }}>
        {input("name", p.businessName, { maxLength: 120, autoComplete: "organization" })}
        {input("phone", p.phone, { maxLength: 40, type: "tel", autoComplete: "tel" })}
        {input("address", p.address)}
      </div>
      <p className="field__err" role="alert">
        {error}
      </p>
      {owner && (
        <div className="btns" style={{ marginTop: 14 }}>
          <button className="btn" type="submit" disabled={busy}>
            {p.save}
          </button>
        </div>
      )}
    </form>
  );
}
