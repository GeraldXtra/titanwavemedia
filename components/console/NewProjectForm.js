"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navStart, postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import copy from "@/content/console/new-project";

export default function NewProjectForm() {
  const router = useRouter();
  const [v, setV] = useState({ title: "", where: "", more: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!v.title.trim()) {
      setError(copy.errors.what);
      document.getElementById("np-title").focus();
      return;
    }
    setBusy(true);
    setError("");
    const { data } = await postJson("/api/console/projects", { title: v.title.trim(), where: v.where, more: v.more.trim() });
    if (data.ok) {
      toast(copy.done);
      navStart();
      router.push(`/console/projects/${data.id}`);
      router.refresh();
      return;
    }
    setBusy(false);
    setError(data.message || copy.errors.failed);
  }

  return (
    <form className="c-card" style={{ maxWidth: 720 }} onSubmit={submit} noValidate>
      <div className="field" data-err={error && !v.title.trim() ? "" : undefined}>
        <label htmlFor="np-title">{copy.what}</label>
        <input id="np-title" value={v.title} maxLength={160} placeholder={copy.whatPlaceholder} onChange={(e) => setV({ ...v, title: e.target.value })} aria-describedby="np-err" />
      </div>
      <div className="field">
        <label htmlFor="np-where">{copy.where}</label>
        <select id="np-where" value={v.where} onChange={(e) => setV({ ...v, where: e.target.value })}>
          <option value="">{copy.whereChoose}</option>
          {copy.whereOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="np-more">{copy.more}</label>
        <textarea id="np-more" value={v.more} maxLength={3500} placeholder={copy.morePlaceholder} onChange={(e) => setV({ ...v, more: e.target.value })} />
      </div>
      <p className="field__err" id="np-err" role="alert">
        {error}
      </p>
      <div className="btns" style={{ marginTop: 14 }}>
        <button className="btn btn--solid" type="submit" disabled={busy} aria-busy={busy || undefined}>
          {copy.send}
        </button>
        <Link className="btn" href="/console/projects">
          {copy.cancel}
        </Link>
      </div>
    </form>
  );
}
