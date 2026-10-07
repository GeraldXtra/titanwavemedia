"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/assist";

const t = copy.team;

export default function PlanForm({ business, price, limit, billingOn, nextDay, priceText }) {
  const router = useRouter();
  const [values, setValues] = useState({ price: price ? String(price / 100) : "", limit: String(limit) });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [on, setOn] = useState(billingOn);

  async function save(e) {
    e.preventDefault();
    const n = Number(values.limit.replace(/[\s,]/g, ""));
    if (!values.limit.trim() || !Number.isInteger(n) || n < 0 || n > 1000000) {
      setErrors({ limit: t.limitError });
      document.getElementById("as-limit").focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/assist/plan", { business, price: values.price, limit: n });
    setBusy(false);
    if (!data.ok) {
      const field = data.field === "limit" ? "limit" : "price";
      setErrors({ [field]: data.message || copy.failed });
      document.getElementById(field === "limit" ? "as-limit" : "as-price").focus();
      return;
    }
    setErrors({});
    toast(data.message);
    router.refresh();
  }

  async function billing(next) {
    setBusy(true);
    const { data } = await postJson("/api/console/assist/plan", { business, billing: next });
    setBusy(false);
    if (!data.ok) return toast(data.message || copy.failed);
    setOn(next);
    toast(data.message);
    router.refresh();
  }

  const field = (key, id, label, hint) => (
    <div className="field" data-err={errors[key] ? "" : undefined}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode={key === "price" ? "decimal" : "numeric"}
        autoComplete="off"
        value={values[key]}
        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        aria-invalid={errors[key] ? "true" : undefined}
        aria-describedby={`${id}-hint ${id}-err`}
      />
      <p className="field__hint" id={`${id}-hint`}>
        {hint}
      </p>
      <p className="field__err" id={`${id}-err`}>
        {errors[key]}
      </p>
    </div>
  );

  return (
    <section className="c-card as-plan" aria-labelledby="as-plan-h">
      <h2 id="as-plan-h">{t.planTitle}</h2>
      <p style={{ marginTop: 6 }}>{t.planText}</p>
      <form className="as-plan__form" onSubmit={save} noValidate>
        {field("price", "as-price", t.price, t.priceHint)}
        {field("limit", "as-limit", t.limit, t.limitHint)}
        <div className="btns">
          <button className="btn" type="submit" disabled={busy}>
            {t.planSave}
          </button>
        </div>
      </form>
      <div className="c-toggle as-billing">
        <span className="c-toggle__text">
          <b id="as-billing-label">{t.billing}</b>
          <small id="as-billing-line">{!price && !on ? t.billingNoPrice : on ? format(t.billingOn, { date: nextDay, price: priceText }) : t.billingOff}</small>
        </span>
        <label className="switch">
          <input
            type="checkbox"
            role="switch"
            checked={on}
            aria-checked={on ? "true" : "false"}
            disabled={busy || (!on && !price)}
            onChange={(e) => billing(e.target.checked)}
            aria-labelledby="as-billing-label"
            aria-describedby="as-billing-line as-billing-note"
          />
          <span className="switch__track" aria-hidden="true" />
        </label>
      </div>
      <p className="note" id="as-billing-note">
        {t.billingNote}
      </p>
    </section>
  );
}
