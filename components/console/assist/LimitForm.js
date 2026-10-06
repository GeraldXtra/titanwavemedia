"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import copy from "@/content/console/assist";

const t = copy.team;

// Team view only: the business's monthly limit of conversations.
export default function LimitForm({ business, limit }) {
  const router = useRouter();
  const [value, setValue] = useState(String(limit));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const n = Number(value.replace(/[\s,]/g, ""));
    if (!value.trim() || !Number.isInteger(n) || n < 0 || n > 1000000) {
      setError(t.limitError);
      document.getElementById("as-limit").focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/assist/limit", { business, limit: n });
    setBusy(false);
    if (!data.ok) return setError(data.message || copy.failed);
    setError("");
    toast(data.message);
    router.refresh();
  }

  return (
    <form className="c-card as-limit" onSubmit={submit} noValidate>
      <div className="field" data-err={error ? "" : undefined}>
        <label htmlFor="as-limit">{t.limit}</label>
        <input
          id="as-limit"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby="as-limit-hint as-limit-err"
        />
        <p className="field__hint" id="as-limit-hint">
          {t.limitHint}
        </p>
        <p className="field__err" id="as-limit-err" role="alert">
          {error}
        </p>
      </div>
      <div className="btns">
        <button className="btn" type="submit" disabled={busy}>
          {t.limitSave}
        </button>
      </div>
    </form>
  );
}
