"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../Icon";
import Dialog from "../Dialog";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/assist";

// The small actions on Wave Assist's conversations. `business` is set in Team view, so the
// server knows it is a team request for that business.
const withBusiness = (business, body) => (business ? { ...body, business } : body);

// "Mark as handled" on the details a customer left.
export function MarkHandled({ id, business, label }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function mark() {
    setBusy(true);
    const { data } = await postJson(`/api/console/assist/handovers/${id}`, withBusiness(business, { handled: true }));
    setBusy(false);
    toast(data.ok ? data.message : data.message || copy.failed);
    if (data.ok) router.refresh();
  }

  return (
    <button className="btn btn--sm" type="button" onClick={mark} disabled={busy} aria-label={label}>
      <Icon name="check" />
      {copy.conversations.handled}
    </button>
  );
}

// "Delete this conversation", after a question. Back to the list once it is gone.
export function DeleteConversation({ id, business, back }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const t = copy.conversation;

  async function remove() {
    setBusy(true);
    const { data } = await postJson(`/api/console/assist/conversations/${id}`, withBusiness(business, {}), { method: "DELETE" });
    setBusy(false);
    if (!data.ok) {
      setOpen(false);
      return toast(data.message || copy.failed);
    }
    setOpen(false);
    toast(data.message);
    router.push(back);
    router.refresh();
  }

  return (
    <>
      <button className="btn btn--danger" type="button" onClick={() => setOpen(true)}>
        {t.delete}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t.deleteTitle} labelId="as-delete">
        <p>{t.deleteText}</p>
        <div className="btns" style={{ marginTop: 14 }}>
          <button className="btn btn--danger" type="button" onClick={remove} disabled={busy}>
            {t.deleteYes}
          </button>
          <button className="btn" type="button" onClick={() => setOpen(false)}>
            {t.deleteNo}
          </button>
        </div>
      </Dialog>
    </>
  );
}

// "Add an answer" on a question it couldn't answer: a small form with the question already in.
export function AddAnswer({ questionKey, text, business, n }) {
  const router = useRouter();
  const t = copy.questions;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(text);
  const [a, setA] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const qId = `as-aq-${n}`;
  const aId = `as-aa-${n}`;

  function show() {
    setQ(text);
    setA("");
    setErrors({});
    setMessage("");
    setOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!q.trim()) found.question = t.errors.question;
    else if (q.trim().length > 300) found.question = t.errors.long;
    if (!a.trim()) found.answer = t.errors.answer;
    else if (a.trim().length > 2000) found.answer = t.errors.long;
    setErrors(found);
    setMessage("");
    if (found.question || found.answer) {
      document.getElementById(found.question ? qId : aId).focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/assist/answer", withBusiness(business, { key: questionKey, question: q.trim(), answer: a.trim() }));
    setBusy(false);
    if (!data.ok) {
      if (data.errors) setErrors(data.errors);
      return setMessage(data.message || (data.errors ? "" : copy.failed));
    }
    setOpen(false);
    toast(data.message);
    router.refresh();
  }

  return (
    <>
      <button className="btn btn--sm" type="button" onClick={show} aria-label={format(t.addLabel, { question: text })}>
        <Icon name="plus" />
        {t.add}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t.dialogTitle} labelId={`as-add-${n}`}>
        <form onSubmit={submit} noValidate>
          <div className="field" data-err={errors.question ? "" : undefined}>
            <label htmlFor={qId}>{t.question}</label>
            <input
              id={qId}
              value={q}
              maxLength={300}
              onChange={(e) => setQ(e.target.value)}
              aria-invalid={errors.question ? "true" : undefined}
              aria-describedby={`${qId}-hint ${qId}-err`}
            />
            <p className="field__hint" id={`${qId}-hint`}>
              {t.questionHint}
            </p>
            <p className="field__err" id={`${qId}-err`}>
              {errors.question}
            </p>
          </div>
          <div className="field" data-err={errors.answer ? "" : undefined}>
            <label htmlFor={aId}>{t.answer}</label>
            <textarea id={aId} value={a} maxLength={2000} onChange={(e) => setA(e.target.value)} aria-invalid={errors.answer ? "true" : undefined} aria-describedby={`${aId}-err`} />
            <p className="field__err" id={`${aId}-err`}>
              {errors.answer}
            </p>
          </div>
          <p className="field__err" role="alert">
            {message}
          </p>
          <div className="btns" style={{ marginTop: 12 }}>
            <button className="btn btn--solid" type="submit" disabled={busy}>
              {t.save}
            </button>
            <button className="btn" type="button" onClick={() => setOpen(false)}>
              {t.cancel}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
