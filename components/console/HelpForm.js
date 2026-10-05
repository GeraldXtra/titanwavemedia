"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import copy from "@/content/console/help";

// Ask for help: it becomes a request with the status New, and lands in our Team inbox.
export default function HelpForm() {
  const router = useRouter();
  const f = copy.form;
  const [v, setV] = useState({ subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!v.subject.trim()) found.subject = f.errors.subject;
    if (v.message.trim().length < 10) found.message = f.errors.message;
    setErrors(found);
    const bad = ["subject", "message"].find((k) => found[k]);
    if (bad) {
      document.getElementById(`hp-${bad}`).focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/help", { subject: v.subject.trim(), message: v.message.trim() });
    setBusy(false);
    if (!data.ok) {
      setErrors({ form: data.message || f.errors.failed });
      return;
    }
    toast(f.done);
    router.push(`/console/help/${data.id}`);
    router.refresh();
  }

  return (
    <form className="c-card" onSubmit={submit} noValidate>
      <h2>{f.title}</h2>
      <div className="field" style={{ marginTop: 12 }} data-err={errors.subject ? "" : undefined}>
        <label htmlFor="hp-subject">{f.subject}</label>
        <input id="hp-subject" value={v.subject} maxLength={200} placeholder={f.subjectPlaceholder} onChange={(e) => setV({ ...v, subject: e.target.value })} aria-invalid={errors.subject ? "true" : undefined} aria-describedby="hp-subject-err" />
        <p className="field__err" id="hp-subject-err">
          {errors.subject}
        </p>
      </div>
      <div className="field" data-err={errors.message ? "" : undefined}>
        <label htmlFor="hp-message">{f.message}</label>
        <textarea id="hp-message" value={v.message} maxLength={4000} onChange={(e) => setV({ ...v, message: e.target.value })} aria-invalid={errors.message ? "true" : undefined} aria-describedby="hp-message-help hp-message-err" />
        <p className="field__hint" id="hp-message-help">
          {f.messageHelp}
        </p>
        <p className="field__err" id="hp-message-err">
          {errors.message}
        </p>
      </div>
      <div className="btns" style={{ marginTop: 14 }}>
        <button className="btn btn--solid" type="submit" disabled={busy}>
          {f.send}
        </button>
      </div>
      <p className="field__err" role="alert">
        {errors.form}
      </p>
    </form>
  );
}
