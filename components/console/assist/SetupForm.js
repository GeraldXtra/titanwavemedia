"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../Icon";
import { postJson } from "@/lib/client";
import { cleanColor } from "@/lib/assist/color";
import { MAX, MAX_DOCS, MAX_KNOWLEDGE, MAX_QA, MAX_STARTERS, checkSetup, colorReport, hasReach, knowledgeSize } from "@/lib/assist/setup";
import { MAX_SITES, cleanSite } from "@/lib/assist/sites";
import { lagosClock } from "@/lib/format";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/assist";
import chatWords from "@/content/assist";

const t = copy.setup;
const e = t.errors;
const dt = t.docs;
const ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";
const n0 = (x) => Number(x || 0).toLocaleString("en-NG");

export default function SetupForm({ initial, on = false, business }) {
  const router = useRouter();
  const keyRef = useRef(0);
  const withKey = (p) => ({ ...p, k: ++keyRef.current });
  const [v, setV] = useState(() => ({
    ...initial,
    qa: (initial.qa || []).map(withKey),
    docs: (initial.docs || []).map(withKey),
    starters: [...(initial.starters || []), "", "", "", ""].slice(0, MAX_STARTERS),
  }));
  const [siteInput, setSiteInput] = useState("");
  const [siteNote, setSiteNote] = useState({ text: "", error: false });
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(null);
  const [docBusy, setDocBusy] = useState("");
  const [docNote, setDocNote] = useState({ text: "", error: false });
  const reviewRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (review && reviewRef.current) reviewRef.current.focus();
  }, [review && review.key]);

  const set = (k) => (ev) => setV({ ...v, [k]: ev.target.value });
  const report = colorReport(v.color);
  const shownName = v.name.trim();
  const defaultGreeting = format(chatWords.greeting, { business: shownName || chatWords.noName });

  function fieldError(k) {
    const code = errors[k];
    if (!code) return "";
    if (code === "long") return format(e.long, { max: MAX[k].toLocaleString("en-NG") });
    if (k === "starters") return code === "long" ? e.startersLong : e.many;
    return e[code] || e.summary;
  }
  const qaError = (i) => {
    const code = errors.qa && errors.qa[i];
    return code === "half" ? e.half : code === "long" ? e.qaLong : "";
  };

  function addQa() {
    if (v.qa.length >= MAX_QA) return;
    const next = withKey({ q: "", a: "" });
    setV({ ...v, qa: [...v.qa, next] });
    setTimeout(() => {
      const el = document.getElementById(`as-q-${next.k}`);
      if (el) el.focus();
    }, 0);
  }

  function removeQa(i) {
    const qa = v.qa.filter((_, j) => j !== i);
    setV({ ...v, qa });
    if (errors.qa) setErrors({ ...errors, qa: undefined });
    setTimeout(() => {
      const next = qa[i] || qa[i - 1];
      const el = next ? document.getElementById(`as-q-${next.k}`) : document.getElementById("as-addqa");
      if (el) el.focus();
    }, 0);
  }

  function setQa(i, field, value) {
    setV({ ...v, qa: v.qa.map((p, j) => (j === i ? { ...p, [field]: value } : p)) });
  }

  function setStarter(i, value) {
    setV({ ...v, starters: v.starters.map((s, j) => (j === i ? value : s)) });
  }

  function addSite() {
    const r = cleanSite(siteInput);
    if (!r.ok) return setSiteNote({ text: t.siteErrors[r.error] || t.siteErrors.not_host, error: true });
    if (v.sites.includes(r.site)) return setSiteNote({ text: format(t.siteErrors.already, { site: r.site }), error: true });
    if (v.sites.length >= MAX_SITES) return setSiteNote({ text: t.siteErrors.too_many, error: true });
    setV({ ...v, sites: [...v.sites, r.site] });
    setSiteInput("");
    setSiteNote({ text: format(t.siteAdded, { site: r.site }), error: false });
  }

  function removeSite(site) {
    setV({ ...v, sites: v.sites.filter((s) => s !== site) });
    setSiteNote({ text: "", error: false });
    setTimeout(() => document.getElementById("as-site").focus(), 0);
  }

  async function readFile(file) {
    if (v.docs.length >= MAX_DOCS) return setDocNote({ text: dt.full, error: true });
    if (file.size > 4 * 1024 * 1024) return setDocNote({ text: dt.errors.size, error: true });
    setDocBusy(file.name);
    setDocNote({ text: "", error: false });
    const form = new FormData();
    form.append("file", file);
    if (business) form.append("business", business);
    let data = null;
    try {
      const res = await fetch("/api/console/assist/document", { method: "POST", body: form, credentials: "same-origin" });
      data = await res.json().catch(() => null);
    } catch {}
    setDocBusy("");
    if (!data || !data.ok) return setDocNote({ text: (data && data.message) || dt.errors.read, error: true });
    setReview({ key: Date.now(), index: -1, name: data.name, text: data.text, cut: data.cut, error: "" });
  }

  function keepReview() {
    const text = review.text.replace(/\r\n?/g, "\n").trim();
    const name = review.name.replace(/\s+/g, " ").trim().slice(0, MAX.docName) || "Document";
    if (!text) return setReview({ ...review, error: dt.errors.text });
    const docs = review.index < 0 ? [...v.docs, withKey({ name, text, added: null })] : v.docs.map((d, i) => (i === review.index ? { ...d, name, text } : d));
    setV({ ...v, docs });
    setReview(null);
    if (errors.docs || errors.knowledge) setErrors({ ...errors, docs: undefined, knowledge: undefined });
    setDocNote({ text: format(review.index < 0 ? dt.added : dt.changed, { name }), error: false });
    setTimeout(() => {
      const el = document.getElementById("as-docs-file");
      if (el) el.focus();
    }, 0);
  }

  function removeDoc(i) {
    const gone = v.docs[i];
    setV({ ...v, docs: v.docs.filter((_, j) => j !== i) });
    setDocNote({ text: format(dt.removed, { name: gone.name }), error: false });
    setTimeout(() => {
      const el = document.getElementById("as-docs-file");
      if (el) el.focus();
    }, 0);
  }

  function focusFirst(found) {
    const order = ["name", "sells", "prices", "hours", "areas", "whatsapp", "phone", "email"];
    let id = order.find((k) => found[k]);
    if (id) id = `as-${id}`;
    else if (found.reach) id = "as-whatsapp";
    else if (found.qa) {
      const i = Number(Object.keys(found.qa)[0]);
      id = v.qa[i] ? `as-q-${v.qa[i].k}` : "as-addqa";
    } else if (found.qaCount) id = "as-addqa";
    else if (found.extra) id = "as-extra";
    else if (found.docs || found.docsCount || found.knowledge) id = "as-docs-file";
    else if (found.greeting) id = "as-greeting";
    else if (found.starters) id = "as-starter-0";
    else if (found.color) id = "as-color-code";
    else if (found.sites) id = "as-site";
    const el = id && document.getElementById(id);
    if (el) el.focus();
  }

  async function submit(ev) {
    ev.preventDefault();
    const body = { ...v, qa: v.qa.map(({ q, a }) => ({ q, a })), docs: v.docs.map(({ name, text, added }) => ({ name, text, ...(added ? { added } : {}) })) };
    const check = checkSetup(body);
    if (check.ok && on && !hasReach(check.values)) {
      check.ok = false;
      check.errors.reach = "reach";
    }
    if (!check.ok) {
      setErrors(check.errors);
      setSummary(e.summary);
      focusFirst(check.errors);
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/assist/setup", business ? { ...body, business } : body);
    setBusy(false);
    if (!data.ok) {
      setErrors(data.errors || {});
      setSummary(data.message || copy.failed);
      if (data.errors) focusFirst(data.errors);
      return;
    }
    const s = data.values;
    setV({
      ...v,
      ...s,
      color: s.color,
      qa: s.qa.map(withKey),
      docs: s.docs.map(withKey),
      starters: [...s.starters, "", "", "", ""].slice(0, MAX_STARTERS),
    });
    setErrors({});
    setSummary("");
    setSavedAt(format(t.savedAt, { time: lagosClock() }));
    toast(t.saved);
    router.refresh();
  }

  const field = (k, label, { hint, area = false, rows, type = "text", autoComplete = "off", inputMode } = {}) => {
    const err = fieldError(k);
    const ids = [hint && `as-${k}-hint`, `as-${k}-err`].filter(Boolean).join(" ");
    const props = {
      id: `as-${k}`,
      value: v[k],
      onChange: set(k),
      maxLength: MAX[k] ? MAX[k] + 200 : undefined,
      "aria-invalid": err ? "true" : undefined,
      "aria-describedby": ids,
      autoComplete,
    };
    return (
      <div className="field" data-err={err ? "" : undefined}>
        <label htmlFor={`as-${k}`}>{label}</label>
        {area ? <textarea {...props} rows={rows} /> : <input {...props} type={type} inputMode={inputMode} />}
        {hint && (
          <p className="field__hint" id={`as-${k}-hint`}>
            {hint}
          </p>
        )}
        <p className="field__err" id={`as-${k}-err`}>
          {err}
        </p>
      </div>
    );
  };

  const used = knowledgeSize({ ...v, docs: v.docs });
  const knowledgeLine = (id) => (
    <p className={`field__hint${used > MAX_KNOWLEDGE ? " as-over" : ""}`} id={id}>
      {format(t.knowledge, { count: n0(used) })}
    </p>
  );
  const colorValue = cleanColor(v.color) || "#0b0b0b";
  const preview = report || { color: "#0b0b0b", text: "#ffffff" };
  const label = shownName ? format(t.label, { business: shownName }) : t.labelNoName;

  return (
    <form className="as-setup" onSubmit={submit} noValidate>
      <div className="c-card">
        <h2>{t.title}</h2>
        <p style={{ marginTop: 6 }}>{t.text}</p>
      </div>

      <section className="c-card" aria-labelledby="as-h-business">
        <h2 id="as-h-business">{t.business}</h2>
        <div className="as-fields">
          {field("name", t.name, { hint: format(t.nameHint, { business: shownName || chatWords.noName }), autoComplete: "organization" })}
          {field("sells", t.sells, { hint: t.sellsHint, area: true, rows: 3 })}
          {field("prices", t.prices, { hint: t.pricesHint, area: true, rows: 6 })}
          {field("hours", t.hours)}
          {field("areas", t.areas)}
        </div>
      </section>

      <section className="c-card" aria-labelledby="as-h-reach">
        <h2 id="as-h-reach">{t.reach}</h2>
        <p style={{ marginTop: 6 }}>{t.reachText}</p>
        <div className="as-fields">
          {field("whatsapp", t.whatsapp, { hint: t.whatsappHint, type: "tel", inputMode: "tel" })}
          {field("phone", t.phone, { type: "tel", autoComplete: "tel" })}
          {field("email", t.email, { type: "email", autoComplete: "email" })}
        </div>
        {errors.reach && <p className="field__err">{e.reach}</p>}
      </section>

      <section className="c-card" aria-labelledby="as-h-qa">
        <div className="c-row">
          <h2 id="as-h-qa">{t.qa}</h2>
          <span className="note">{format(t.qaCount, { count: v.qa.length })}</span>
        </div>
        <p style={{ marginTop: 6 }}>{t.qaText}</p>
        {v.qa.length ? (
          <ol className="as-qa">
            {v.qa.map((p, i) => {
              const err = qaError(i);
              const n = i + 1;
              return (
                <li key={p.k} className="as-qa__item" data-err={err ? "" : undefined}>
                  <div className="field">
                    <label htmlFor={`as-q-${p.k}`}>{format(t.question, { n })}</label>
                    <input id={`as-q-${p.k}`} value={p.q} maxLength={MAX.question + 50} onChange={(ev) => setQa(i, "q", ev.target.value)} aria-invalid={err ? "true" : undefined} aria-describedby={err ? `as-qa-err-${p.k}` : undefined} />
                  </div>
                  <div className="field">
                    <label htmlFor={`as-a-${p.k}`}>{format(t.answer, { n })}</label>
                    <textarea id={`as-a-${p.k}`} value={p.a} rows={3} maxLength={MAX.answer + 200} onChange={(ev) => setQa(i, "a", ev.target.value)} aria-invalid={err ? "true" : undefined} aria-describedby={err ? `as-qa-err-${p.k}` : undefined} />
                  </div>
                  <button className="btn btn--sm as-qa__remove" type="button" onClick={() => removeQa(i)} aria-label={format(t.removeQa, { n })}>
                    <Icon name="close" />
                  </button>
                  {err && (
                    <p className="field__err as-qa__err" id={`as-qa-err-${p.k}`}>
                      {err}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="note" style={{ marginTop: 12 }}>
            {t.qaEmpty}
          </p>
        )}
        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn btn--sm" type="button" id="as-addqa" onClick={addQa} disabled={v.qa.length >= MAX_QA} aria-describedby={v.qa.length >= MAX_QA ? "as-qa-full" : undefined}>
            <Icon name="plus" />
            {t.addQa}
          </button>
          {v.qa.length >= MAX_QA && (
            <span className="note" id="as-qa-full" style={{ alignSelf: "center" }}>
              {t.qaFull}
            </span>
          )}
        </div>
        {errors.qaCount && <p className="field__err">{e.many}</p>}
      </section>

      <section className="c-card" aria-labelledby="as-h-extra">
        <h2 id="as-h-extra">
          <label htmlFor="as-extra">{t.extra}</label>
        </h2>
        <div className="field as-fields" data-err={fieldError("extra") ? "" : undefined}>
          <textarea
            id="as-extra"
            value={v.extra}
            rows={8}
            maxLength={MAX.extra + 500}
            onChange={set("extra")}
            aria-invalid={fieldError("extra") ? "true" : undefined}
            aria-describedby="as-extra-hint as-knowledge-extra as-extra-err"
          />
          <p className="field__hint" id="as-extra-hint">
            {t.extraHint}
          </p>
          {knowledgeLine("as-knowledge-extra")}
          <p className="field__err" id="as-extra-err">
            {fieldError("extra")}
          </p>
        </div>
      </section>

      <section className="c-card" id="as-docs" aria-labelledby="as-h-docs">
        <div className="c-row">
          <h2 id="as-h-docs">{dt.title}</h2>
          <span className="note">{format(dt.count, { count: v.docs.length })}</span>
        </div>
        <p style={{ marginTop: 6 }}>{dt.text}</p>
        {v.docs.length ? (
          <ul className="as-docs">
            {v.docs.map((d, i) => (
              <li key={d.k} data-err={errors.docs && errors.docs[i] ? "" : undefined}>
                <Icon name="read" />
                <span className="as-docs__name">
                  <b>{d.name}</b>
                  <span className="note">{format(dt.chars, { count: n0(d.text.length) })}</span>
                  {errors.docs && errors.docs[i] && <span className="field__err">{errors.docs[i] === "long" ? format(e.long, { max: n0(MAX.docText) }) : e.docEmpty}</span>}
                </span>
                <span className="btns">
                  <button className="btn btn--sm" type="button" onClick={() => setReview({ key: Date.now(), index: i, name: d.name, text: d.text, cut: false, error: "" })} aria-label={format(dt.editLabel, { name: d.name })}>
                    {dt.edit}
                  </button>
                  <button className="btn btn--sm" type="button" onClick={() => removeDoc(i)} aria-label={format(dt.remove, { name: d.name })}>
                    <Icon name="trash" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="note" style={{ marginTop: 10 }}>
            {dt.empty}
          </p>
        )}
        {review ? (
          <div className="as-review" role="group" aria-labelledby="as-review-h">
            <h3 id="as-review-h" ref={reviewRef} tabIndex={-1}>
              {format(dt.reviewTitle, { name: review.name })}
            </h3>
            <p className="note">{dt.reviewText}</p>
            {review.cut && <p className="as-adjusted">{dt.cut}</p>}
            <div className="field">
              <label htmlFor="as-review-name">{dt.nameLabel}</label>
              <input id="as-review-name" value={review.name} maxLength={MAX.docName} onChange={(ev) => setReview({ ...review, name: ev.target.value })} />
            </div>
            <div className="field" data-err={review.error ? "" : undefined}>
              <label htmlFor="as-review-text">{dt.textLabel}</label>
              <textarea
                id="as-review-text"
                rows={12}
                value={review.text}
                maxLength={MAX.docText}
                onChange={(ev) => setReview({ ...review, text: ev.target.value, error: "" })}
                aria-invalid={review.error ? "true" : undefined}
                aria-describedby="as-review-count as-review-err"
              />
              <p className="field__hint" id="as-review-count">
                {format(dt.chars, { count: n0(review.text.length) })}
              </p>
              <p className="field__err" id="as-review-err">
                {review.error}
              </p>
            </div>
            <div className="btns">
              <button className="btn" type="button" onClick={keepReview}>
                {review.index < 0 ? dt.addIt : dt.keep}
              </button>
              <button className="btn" type="button" onClick={() => setReview(null)}>
                {dt.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="field as-fields" data-err={docNote.error || errors.docsCount || errors.knowledge ? "" : undefined}>
            <span className="c-upload">
              <label className="btn btn--sm" htmlFor="as-docs-file">
                <Icon name="upload" />
                {docBusy ? format(dt.reading, { name: docBusy }) : dt.add}
              </label>
              <input
                ref={fileRef}
                id="as-docs-file"
                className="sr-only"
                type="file"
                accept={ACCEPT}
                disabled={Boolean(docBusy) || v.docs.length >= MAX_DOCS}
                aria-describedby="as-docs-rules as-docs-note"
                onChange={(ev) => {
                  const f = ev.target.files && ev.target.files[0];
                  ev.target.value = "";
                  if (f) readFile(f);
                }}
              />
            </span>
            <p className="field__hint" id="as-docs-rules">
              {v.docs.length >= MAX_DOCS ? dt.full : dt.rules}
            </p>
            <p className={docNote.error ? "field__err" : "field__hint"} id="as-docs-note" role="status">
              {docNote.text}
            </p>
            {errors.docsCount && <p className="field__err">{e.many}</p>}
            {errors.knowledge && <p className="field__err">{format(e.knowledge, { count: n0(used) })}</p>}
          </div>
        )}
        {knowledgeLine("as-knowledge-docs")}
      </section>

      <section className="c-card" aria-labelledby="as-h-chat">
        <h2 id="as-h-chat">{t.chat}</h2>
        <div className="as-fields">
          {field("greeting", t.greeting, { hint: format(t.greetingHint, { greeting: defaultGreeting }), area: true, rows: 2 })}
          <fieldset className="as-group" data-err={errors.starters ? "" : undefined} aria-describedby="as-starters-hint as-starters-err">
            <legend>{t.starters}</legend>
            <p className="field__hint" id="as-starters-hint">
              {t.startersHint}
            </p>
            <div className="as-starters">
              {v.starters.map((s, i) => (
                <div className="field" key={i}>
                  <label htmlFor={`as-starter-${i}`}>{format(t.starter, { n: i + 1 })}</label>
                  <input id={`as-starter-${i}`} value={s} maxLength={MAX.starter + 50} onChange={(ev) => setStarter(i, ev.target.value)} aria-invalid={errors.starters ? "true" : undefined} />
                </div>
              ))}
            </div>
            <p className="field__err" id="as-starters-err">
              {fieldError("starters")}
            </p>
          </fieldset>
        </div>
      </section>

      <section className="c-card" aria-labelledby="as-h-look">
        <h2 id="as-h-look">{t.look}</h2>
        <div className="as-look">
          <div className="as-fields">
            <fieldset className="as-group" data-err={errors.color ? "" : undefined}>
              <legend>{t.color}</legend>
              <div className="as-color">
                <div className="field">
                  <label htmlFor="as-color">{t.colorPick}</label>
                  <input id="as-color" type="color" value={colorValue} onChange={(ev) => setV({ ...v, color: ev.target.value })} aria-describedby="as-color-report" />
                </div>
                <div className="field">
                  <label htmlFor="as-color-code">{t.colorCode}</label>
                  <input
                    id="as-color-code"
                    value={v.color}
                    maxLength={9}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={set("color")}
                    aria-invalid={!report ? "true" : undefined}
                    aria-describedby="as-color-hint as-color-report"
                  />
                </div>
              </div>
              <p className="field__hint" id="as-color-hint">
                {t.colorHint}
              </p>
              <div id="as-color-report">
                {report ? (
                  <>
                    <p className="field__hint">{format(t.textOn, { text: report.text === "#ffffff" ? t.white : t.black, ratio: report.ratio })}</p>
                    {report.adjusted && <p className="as-adjusted">{format(t.adjusted, { way: t[report.way], color: report.color })}</p>}
                  </>
                ) : (
                  <p className="field__err">{e.color}</p>
                )}
              </div>
            </fieldset>
            <fieldset className="as-group">
              <legend>{t.corner}</legend>
              <div className="as-radios">
                {["right", "left"].map((c) => (
                  <label key={c} className="as-radio">
                    <input type="radio" name="as-corner" value={c} checked={v.corner === c} onChange={() => setV({ ...v, corner: c })} />
                    {t.corners[c]}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <figure className="as-preview">
            <figcaption>
              <b>{t.preview}</b>
              <span className="note">{t.previewNote}</span>
            </figcaption>
            <div className={`as-preview__page as-preview__page--${v.corner}`} aria-hidden="true">
              <span
                className="as-preview__btn"
                style={{ background: preview.color, color: preview.text, borderColor: preview.text === "#000000" ? "#0b0b0b" : preview.color }}
              >
                {label}
              </span>
            </div>
          </figure>
        </div>
      </section>

      <section className="c-card" id="as-sites" aria-labelledby="as-h-sites">
        <h2 id="as-h-sites">{t.sites}</h2>
        <p style={{ marginTop: 6 }}>{t.sitesText}</p>
        <div className="field as-fields" data-err={siteNote.error || errors.sites ? "" : undefined}>
          <label htmlFor="as-site">{t.site}</label>
          <div className="as-siteline">
            <input
              id="as-site"
              value={siteInput}
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(ev) => setSiteInput(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") {
                  ev.preventDefault();
                  addSite();
                }
              }}
              aria-invalid={siteNote.error ? "true" : undefined}
              aria-describedby="as-site-hint as-site-note"
            />
            <button className="btn" type="button" onClick={addSite}>
              <Icon name="plus" />
              {t.addSite}
            </button>
          </div>
          <p className="field__hint" id="as-site-hint">
            {t.siteHint}
          </p>
          <p className={siteNote.error ? "field__err" : "field__hint"} id="as-site-note" role="status">
            {siteNote.text}
          </p>
          {errors.sites && <p className="field__err">{e.sites}</p>}
        </div>
        {v.sites.length ? (
          <ul className="as-sites">
            {v.sites.map((s) => (
              <li key={s}>
                <Icon name="globe" />
                <span>{s}</span>
                <button className="btn btn--sm" type="button" onClick={() => removeSite(s)} aria-label={format(t.removeSite, { site: s })}>
                  <Icon name="close" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="note" style={{ marginTop: 10 }}>
            {t.sitesEmpty}
          </p>
        )}
      </section>

      <div className="c-card as-savebar">
        <p className="field__err" role="alert">
          {summary}
        </p>
        <div className="btns">
          <button className="btn btn--solid" type="submit" disabled={busy}>
            {t.save}
          </button>
          <p className="note as-saved" role="status">
            {savedAt}
          </p>
        </div>
      </div>
    </form>
  );
}
