"use client";

import { useEffect, useRef, useState } from "react";
import words from "@/content/assist";
import { checkDetails } from "@/lib/assist/details";

const fill = (text, values) => String(text).replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

// "Talk to a person": the business's WhatsApp with the customer's question already typed, and
// "Leave your details" (a name, plus a phone number or an email). `onDetails` sends the details
// and resolves to { ok, error, fields }.
export default function Handover({ business, whatsapp, question, canLeaveDetails, onWhatsapp, onDetails }) {
  const h = words.handover;
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [problem, setProblem] = useState("");
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const thanksRef = useRef(null);
  const detailsRef = useRef(null);
  const wasOpen = useRef(false);

  // Opening the form moves to its first field; Not now goes back to the button.
  useEffect(() => {
    if (open && nameRef.current) nameRef.current.focus();
    if (!open && wasOpen.current && detailsRef.current) detailsRef.current.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (status === "sent" && thanksRef.current) thanksRef.current.focus();
  }, [status]);

  const text = question && question.trim() ? fill(h.whatsappText, { business, question: question.trim() }) : fill(h.whatsappStart, { business });
  const waHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}` : null;

  async function submit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const checked = checkDetails(fields);
    setProblem("");
    if (!checked.ok) {
      setErrors(checked.errors);
      const first = checked.errors.name ? nameRef : checked.errors.phone || checked.errors.contact ? phoneRef : emailRef;
      if (first.current) first.current.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    const r = await onDetails(checked.values);
    if (r && r.ok) {
      setStatus("sent");
      return;
    }
    setStatus("idle");
    if (r && r.fields) setErrors(r.fields);
    setProblem(r && r.error === "limit" ? h.errors.limit : h.errors.failed);
  }

  // A field's own error shows under it. "A phone number or an email" shows once, after both.
  const field = (key, label, ref, type, autoComplete) => {
    const own = errors[key];
    const contact = key !== "name" && errors.contact;
    const id = `wa-${key}`;
    return (
      <div className="wa-field">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          ref={ref}
          type={type}
          autoComplete={autoComplete}
          inputMode={key === "phone" ? "tel" : undefined}
          maxLength={key === "email" ? 254 : key === "phone" ? 40 : 100}
          value={fields[key]}
          onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
          aria-invalid={own || contact ? "true" : undefined}
          aria-describedby={own ? `${id}-err` : contact ? "wa-contact-err" : "wa-rule"}
        />
        {own && (
          <p className="wa-err" id={`${id}-err`}>
            {h.errors[own]}
          </p>
        )}
      </div>
    );
  };

  return (
    <section className="wa-hand" aria-labelledby="wa-hand-title">
      <h2 id="wa-hand-title">{h.title}</h2>
      {status === "sent" ? (
        <p className="wa-thanks" ref={thanksRef} tabIndex={-1} role="status">
          {fill(h.thanks, { business })}
        </p>
      ) : (
        <>
          <div className="wa-hand__ways">
            {waHref && (
              <a className="wa-btn wa-btn--main" href={waHref} target="_blank" rel="noopener noreferrer" onClick={onWhatsapp}>
                <svg className="wa-ico" aria-hidden="true">
                  <use href="#i-wa" />
                </svg>
                {fill(h.whatsapp, { business })}
                <span className="sr-only"> {words.newTab}</span>
              </a>
            )}
            {canLeaveDetails && !open && (
              <button className="wa-btn" type="button" ref={detailsRef} aria-expanded="false" onClick={() => setOpen(true)}>
                {h.details}
              </button>
            )}
          </div>
          {canLeaveDetails && open && (
            <form className="wa-details" noValidate onSubmit={submit} aria-labelledby="wa-details-title">
              <h3 id="wa-details-title">{h.details}</h3>
              <p className="wa-line">{fill(h.detailsLine, { business })}</p>
              <p className="wa-rule" id="wa-rule">
                {h.rule}
              </p>
              {field("name", h.name, nameRef, "text", "name")}
              {field("phone", h.phone, phoneRef, "tel", "tel")}
              {field("email", h.email, emailRef, "email", "email")}
              {errors.contact && (
                <p className="wa-err" id="wa-contact-err">
                  {h.errors.contact}
                </p>
              )}
              {problem && (
                <p className="wa-err" role="alert">
                  {problem}
                </p>
              )}
              <div className="wa-hand__ways">
                <button className="wa-btn wa-btn--main" type="submit" disabled={status === "sending"}>
                  {h.send}
                </button>
                <button className="wa-btn" type="button" onClick={() => setOpen(false)}>
                  {h.cancel}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
