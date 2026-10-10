"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../Icon";
import Dialog from "../Dialog";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/team-members";

export default function TeamMembersPanel({ owner, members }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const busy = sending || pending;
  const [doing, setDoing] = useState("");
  const [removing, setRemoving] = useState(null);

  async function add(e) {
    setDoing("add");
    e.preventDefault();
    if (!isEmail(email.trim())) {
      setError(copy.errors.email);
      return document.getElementById("tmb-email").focus();
    }
    setBusy(true);
    const { data } = await postJson("/api/console/team/members", { email: email.trim() });
    setBusy(false);
    if (!data.ok) return setError(data.message || copy.errors.failed);
    setError("");
    setEmail("");
    toast(data.message);
    startTransition(() => router.refresh());
  }

  async function remove() {
    setDoing("remove");
    setBusy(true);
    const { data } = await postJson("/api/console/team/members", { id: removing.id }, { method: "DELETE" });
    setBusy(false);
    setRemoving(null);
    toast(data.message || copy.errors.failed);
    startTransition(() => router.refresh());
  }

  return (
    <div className="c-split">
      <form className="c-card" onSubmit={add} noValidate>
        <h2>{copy.form.title}</h2>
        <div className="field" style={{ marginTop: 12 }} data-err={error ? "" : undefined}>
          <label htmlFor="tmb-email">{copy.form.label}</label>
          <input id="tmb-email" type="email" autoComplete="off" value={email} placeholder={copy.form.placeholder} onChange={(e) => setEmail(e.target.value)} aria-invalid={error ? "true" : undefined} aria-describedby="tmb-help tmb-err" />
          <p className="field__hint" id="tmb-help">
            {copy.form.help}
          </p>
          <p className="field__err" id="tmb-err" role="alert">
            {error}
          </p>
        </div>
        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn btn--solid" type="submit" disabled={busy} aria-busy={(busy && doing === "add") || undefined}>
            {copy.form.button}
          </button>
        </div>
      </form>
      <div className="c-card">
        <h2>{copy.list.title}</h2>
        <ul className="c-list" style={{ marginTop: 12 }}>
          <li>
            <Icon name="users" />
            <span>
              <b>{owner}</b>
              <br />
              <span className="note">{copy.list.owner}</span>
            </span>
          </li>
          {members.map((m) => (
            <li key={m.id}>
              <Icon name={m.joined ? "users" : "mail"} />
              <span>
                <b>{m.name || m.email}</b>
                <br />
                <span className="note">
                  {copy.list.member}
                  {m.name ? `, ${m.email}` : ""}
                  {!m.joined ? `. ${copy.list.waiting}` : ""}
                </span>
              </span>
              <button className="btn btn--sm" type="button" style={{ marginLeft: "auto" }} onClick={() => setRemoving(m)}>
                {copy.list.remove}
              </button>
            </li>
          ))}
        </ul>
        {!members.length && <p style={{ marginTop: 10 }}>{copy.list.empty}</p>}
      </div>
      <Dialog open={Boolean(removing)} onClose={() => setRemoving(null)} title={copy.list.remove} labelId="tmb-remove">
        <p>{removing ? format(copy.list.confirm, { email: removing.email }) : ""}</p>
        <div className="btns" style={{ marginTop: 14 }}>
          <button className="btn btn--danger" type="button" onClick={remove} disabled={busy} aria-busy={(busy && doing === "remove") || undefined}>
            {copy.list.remove}
          </button>
          <button className="btn" type="button" onClick={() => setRemoving(null)}>
            {copy.list.cancel}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
