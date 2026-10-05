"use client";

import { useState } from "react";
import { postJson } from "@/lib/client";
import copy from "@/content/console/start";

// Name and business name for a new console.
export default function StartForm({ name: firstName = "" }) {
  const [v, setV] = useState({ name: firstName, business: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!v.name.trim()) found.name = copy.errors.name;
    if (!v.business.trim()) found.business = copy.errors.business;
    setErrors(found);
    const bad = ["name", "business"].find((k) => found[k]);
    if (bad) {
      document.getElementById(`st-${bad}`).focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/start", { name: v.name.trim(), business: v.business.trim() });
    if (data.ok) {
      window.location.assign("/console");
      return;
    }
    setBusy(false);
    setErrors({ form: copy.errors.failed });
  }

  return (
    <form className="c-card" style={{ maxWidth: 720 }} onSubmit={submit} noValidate>
      {["name", "business"].map((k) => (
        <div className="field" key={k} data-err={errors[k] ? "" : undefined}>
          <label htmlFor={`st-${k}`}>{copy[k]}</label>
          <input
            id={`st-${k}`}
            value={v[k]}
            maxLength={120}
            autoComplete={k === "name" ? "name" : "organization"}
            onChange={(e) => setV({ ...v, [k]: e.target.value })}
            aria-invalid={errors[k] ? "true" : undefined}
            aria-describedby={`st-${k}-err`}
          />
          <p className="field__err" id={`st-${k}-err`}>
            {errors[k]}
          </p>
        </div>
      ))}
      <div className="btns" style={{ marginTop: 16 }}>
        <button className="btn btn--solid" type="submit" disabled={busy}>
          {copy.button}
        </button>
      </div>
      <p className="field__err" role="alert">
        {errors.form}
      </p>
    </form>
  );
}
