"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "./Icon";
import LagosClock from "./LagosClock";
import Rich from "./Rich";
import Email from "./Email";
import { navStart } from "@/lib/client";
import { checkContact, LIMITS } from "@/lib/validate";
import { emailHref, fill, isPh, ph } from "@/lib/text";
import { contactMessage, waLink } from "@/lib/whatsapp";

const ORDER = ["name", "email", "need", "message"];

function Prefill({ onQuery }) {
  const params = useSearchParams();
  useEffect(() => {
    onQuery(params);
  }, [params]);
  return null;
}

const EMPTY = { name: "", email: "", need: "", channel: "", rows: "", product: "", message: "" };

export default function ContactBlock({ copy, site }) {
  const f = copy.form;
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [fromBuilder, setFromBuilder] = useState(false);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const refs = { name: useRef(null), email: useRef(null), need: useRef(null), message: useRef(null) };
  const companyRef = useRef(null);

  const needWord = (v) => copy.needWords[v] || copy.needWords.none;
  const set = (key, value) => {
    if (key === "need") setFromBuilder(false);
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const v = values;
  const waHref = waLink(site.whatsappUrl, contactMessage(copy, v, { fromBuilder }));

  function onQuery(params) {
    const need = params.get("need");
    const msg = params.get("msg");
    const sector = params.get("sector");
    const product = params.get("product");
    setFromBuilder(Boolean(msg) && params.get("from") === "builder");
    setValues((current) => {
      const next = { ...current };
      if (need && f.needs.some((o) => o.value === need)) next.need = need;
      if (product && (!need || need === "tool") && f.extra.tool.options.some((o) => o.value === product)) {
        next.need = "tool";
        next.product = product;
      }
      if (msg) next.message = msg;
      else if (sector && copy.sectorMessages[sector]) next.message = copy.sectorMessages[sector];
      return next;
    });
  }

  function saveSummary() {
    const s = copy.summary;
    const sum = [[s.need, needWord(v.need)]];
    if (v.need === "ai-setup" && v.channel) sum.push([s.channel, v.channel]);
    if (v.need === "data" && v.rows) sum.push([s.rows, v.rows]);
    const product = f.extra.tool.options.find((o) => o.value === v.product);
    if (v.need === "tool" && product) sum.push([s.product, product.label]);
    if (v.name.trim()) sum.push([s.name, v.name.trim()]);
    if (v.email.trim()) sum.push([s.email, v.email.trim()]);
    try {
      sessionStorage.setItem("twm-last", JSON.stringify(sum));
      sessionStorage.setItem("twm-last-email", v.email.trim());
    } catch {}
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (sending) return;
    saveSummary();
    if (companyRef.current && companyRef.current.value) {
      navStart();
      router.push("/thank-you");
      return;
    }
    const found = checkContact(v, f.errors);
    setErrors(found);
    const firstBad = ORDER.find((k) => found[k]);
    if (firstBad) {
      refs[firstBad].current.focus();
      return;
    }
    setSending(true);
    setFailed(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name,
          email: v.email,
          need: v.need,
          channel: v.need === "ai-setup" ? v.channel : "",
          rows: v.need === "data" ? v.rows : "",
          product: v.need === "tool" ? v.product : "",
          message: v.message,
          company: companyRef.current ? companyRef.current.value : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error("not sent");
      setValues(EMPTY);
      setFromBuilder(false);
      navStart();
      router.push("/thank-you");
    } catch {
      setFailed(true);
      setSending(false);
    }
  }

  const field = (key) => ({
    "aria-invalid": errors[key] ? "true" : undefined,
    "aria-describedby": `c-${key === "message" ? "msg" : key}-err`,
  });
  const box = (key) => (errors[key] ? { "data-err": "" } : {});
  const email = site.email;

  return (
    <div className="contact">
      <div className="box contact__side">
        <a className="btn btn--line" id="wa-link" href={waHref} target="_blank" rel="noopener">
          <Icon name="wa" className={null} />
          <span>{copy.side.whatsapp}</span>
        </a>
        <p className="note" style={{ marginTop: 10 }} id="wa-note">
          {copy.side.note}
        </p>
        <ul className="contact__list">
          <li>
            <Icon name="mail" />
            <div>
              <span>{copy.side.email}</span>
              <b className={ph(email)}>
                {isPh(email) ? (
                  email
                ) : (
                  <a href={emailHref(email)}>
                    <Email address={email} />
                  </a>
                )}
              </b>
            </div>
          </li>
          <li>
            <Icon name="pin" />
            <div>
              <span>{copy.side.location}</span>
              <b>{fill(copy.side.locationValue)}</b>
            </div>
          </li>
          <li>
            <Icon name="auto" />
            <div>
              <span>{copy.side.time}</span>
              <b>
                <LagosClock as="span" />
                {copy.side.timeUnit}
              </b>
            </div>
          </li>
        </ul>
        <p className="contact__help">
          {copy.side.help}{" "}
          <Link className="link" href={copy.side.helpLink.href}>
            {copy.side.helpLink.label}
          </Link>
        </p>
      </div>
      <form className="box form" id="contact-form" noValidate onSubmit={onSubmit}>
        <div className="hp" aria-hidden="true">
          <label htmlFor="c-company">{f.honeypot}</label>
          <input id="c-company" name="company" tabIndex={-1} autoComplete="off" ref={companyRef} />
        </div>
        <div className="form__row">
          <div className="field" {...box("name")}>
            <label htmlFor="c-name">{f.name}</label>
            <input
              id="c-name"
              name="name"
              autoComplete="name"
              maxLength={LIMITS.name}
              required
              ref={refs.name}
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              {...field("name")}
            />
            <p className="field__err" id="c-name-err">
              {errors.name}
            </p>
          </div>
          <div className="field" {...box("email")}>
            <label htmlFor="c-email">{f.email}</label>
            <input
              id="c-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={LIMITS.email}
              required
              ref={refs.email}
              value={v.email}
              onChange={(e) => set("email", e.target.value)}
              {...field("email")}
            />
            <p className="field__err" id="c-email-err">
              {errors.email}
            </p>
          </div>
        </div>
        <div className="field" {...box("need")}>
          <label htmlFor="c-need">{f.need}</label>
          <select id="c-need" name="need" required ref={refs.need} value={v.need} onChange={(e) => set("need", e.target.value)} {...field("need")}>
            {f.needs.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="field__err" id="c-need-err">
            {errors.need}
          </p>
        </div>
        <div id="c-extra">
          {Object.entries(f.extra).map(([need, group]) => (
            <fieldset key={need} data-for={need} hidden={v.need !== need} className={group.options.length > 4 ? "checks--grid" : undefined}>
              <legend>{group.legend}</legend>
              {group.options.map((o) => (
                <label className="check" key={o.value}>
                  <input type="radio" name={group.name} value={o.value} checked={v[group.name] === o.value} onChange={() => set(group.name, o.value)} />
                  <span className={ph(o.label)}>{o.label}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </div>
        <div className="field" {...box("message")}>
          <label htmlFor="c-msg">{f.message}</label>
          <textarea
            id="c-msg"
            name="message"
            maxLength={LIMITS.message}
            required
            ref={refs.message}
            value={v.message}
            onChange={(e) => set("message", e.target.value)}
            {...field("message")}
          />
          <p className="field__err" id="c-msg-err">
            {errors.message}
          </p>
        </div>
        <button className="btn btn--solid" type="submit" aria-disabled={sending || undefined} aria-busy={sending || undefined}>
          {f.submit}
        </button>
        {failed && (
          <p className="form-msg is-err" role="alert">
            {f.failed}
          </p>
        )}
        <p className="note">
          <Rich text={f.note} linkClass="link" />
        </p>
      </form>
      <Suspense fallback={null}>
        <Prefill onQuery={onQuery} />
      </Suspense>
    </div>
  );
}
