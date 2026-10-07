"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../Icon";
import Dialog from "../Dialog";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/settings";

const t = copy.team;

export default function TeamPanel({ owner, business, members }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);

  async function invite(e) {
    e.preventDefault();
    if (!isEmail(email.trim())) {
      setError(t.errors.email);
      document.getElementById("tm-email").focus();
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/console/members", { email: email.trim(), role });
    setBusy(false);
    if (!data.ok) return setError(data.message || copy.failed);
    setError("");
    setEmail("");
    toast(data.message);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const { data } = await postJson("/api/console/members", { id: removing.id }, { method: "DELETE" });
    setBusy(false);
    setRemoving(null);
    toast(data.ok ? data.message : data.message || copy.failed);
    router.refresh();
  }

  return (
    <div className="c-card" style={{ maxWidth: 820 }}>
      <h2>{t.title}</h2>
      <p style={{ marginTop: 6 }}>{t.text}</p>
      {owner ? (
        <form onSubmit={invite} noValidate style={{ marginTop: 14 }}>
          <div className="c-grid" style={{ "--n": 2, alignItems: "end" }}>
            <div className="field" data-err={error ? "" : undefined}>
              <label htmlFor="tm-email">{t.email}</label>
              <input id="tm-email" type="email" autoComplete="off" value={email} placeholder={t.emailPlaceholder} onChange={(e) => setEmail(e.target.value)} aria-invalid={error ? "true" : undefined} aria-describedby="tm-err" />
            </div>
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="tm-role">{t.role}</label>
              <select id="tm-role" value={role} onChange={(e) => setRole(e.target.value)} aria-describedby="tm-role-help">
                <option value="member">{t.roles.member}</option>
                <option value="owner">{t.roles.owner}</option>
              </select>
            </div>
          </div>
          <p className="field__hint" id="tm-role-help" style={{ marginTop: 8 }}>
            {t.roleHelp}
          </p>
          <p className="field__err" id="tm-err" role="alert">
            {error}
          </p>
          <div className="btns" style={{ marginTop: 10 }}>
            <button className="btn btn--solid" type="submit" disabled={busy}>
              {t.invite}
            </button>
          </div>
        </form>
      ) : (
        <p className="note" style={{ marginTop: 10 }}>
          {t.ownerOnly}
        </p>
      )}
      <ul className="c-list" style={{ marginTop: 16 }}>
        {members.map((m) => (
          <li key={m.id}>
            <Icon name={m.waiting ? "mail" : "users"} />
            <span>
              <b>{m.name || m.email}</b>
              {m.mine && ` (${t.you})`}
              <br />
              <span className="note">
                {t.roles[m.role]}
                {m.name ? `, ${m.email}` : ""}
                {m.waiting ? `. ${t.waiting}` : ""}
              </span>
            </span>
            {owner && !m.mine && (
              <button className="btn btn--sm" type="button" style={{ marginLeft: "auto" }} onClick={() => setRemoving(m)}>
                {t.remove}
              </button>
            )}
          </li>
        ))}
      </ul>
      <Dialog open={Boolean(removing)} onClose={() => setRemoving(null)} title={removing ? format(t.removeTitle, { email: removing.email }) : ""} labelId="tm-remove">
        <p>{format(t.removeText, { business })}</p>
        <div className="btns" style={{ marginTop: 14 }}>
          <button className="btn btn--danger" type="button" onClick={remove} disabled={busy}>
            {t.removeButton}
          </button>
          <button className="btn" type="button" onClick={() => setRemoving(null)}>
            {t.cancel}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
