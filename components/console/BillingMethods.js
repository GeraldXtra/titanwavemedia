"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../Icon";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/billing";
import shell from "@/content/console/shell";

const m = copy.methods;

// How you pay: saved cards (make default, remove) and automatic payments for Care, with a plain
// line saying exactly what will be charged and when.
export default function BillingMethods({ cards, autopay, autoLine }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action, id) {
    setBusy(true);
    const { data } = await postJson("/api/console/cards", { action, id });
    setBusy(false);
    toast(data.message || (data.ok ? "" : shell.failed));
    router.refresh();
  }

  async function auto(on) {
    setBusy(true);
    const { data } = await postJson("/api/console/autopay", { on });
    setBusy(false);
    toast(data.message || (data.ok ? "" : shell.failed));
    router.refresh();
  }

  return (
    <div className="c-split">
      <div className="c-card">
        <h2>{m.cards}</h2>
        {cards.length ? (
          <ul className="c-cards" style={{ marginTop: 12 }}>
            {cards.map((c) => (
              <li key={c.id} className={c.isDefault ? "is-default" : undefined}>
                <span className="c-cardname">
                  <span className="c-cardlogo" aria-hidden="true">
                    {c.brand}
                  </span>
                  <span>
                    {c.label}
                    {c.expiry && <small>{format(m.expires, { date: c.expiry })}</small>}
                  </span>
                </span>
                <span className="btns">
                  {c.isDefault ? (
                    <span className="c-chip c-chip--solid">{m.default}</span>
                  ) : (
                    <button className="btn btn--sm" type="button" disabled={busy} onClick={() => act("default", c.id)}>
                      {m.makeDefault}
                    </button>
                  )}
                  <button className="btn btn--sm" type="button" disabled={busy} onClick={() => act("remove", c.id)} aria-label={`${m.remove} ${c.label}`}>
                    {m.remove}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ marginTop: 8 }}>{m.cardsEmpty}</p>
        )}
        <p className="note" style={{ marginTop: 12 }}>
          {m.cardsNote}
        </p>
      </div>
      <div className="c-stack">
        <div className="c-card">
          <h2>{m.auto}</h2>
          <div className="c-toggle">
            <span className="c-toggle__text">
              <b id="ap-label">{m.autoLabel}</b>
              <small id="ap-line">{autoLine}</small>
            </span>
            <label className="switch">
              <input type="checkbox" role="switch" checked={autopay} disabled={busy || (!cards.length && !autopay)} onChange={(e) => auto(e.target.checked)} aria-labelledby="ap-label" aria-describedby="ap-line" />
              <span className="switch__track" aria-hidden="true" />
            </label>
          </div>
        </div>
        <div className="c-card">
          <h2>{m.other}</h2>
          <ul className="c-list" style={{ marginTop: 12 }}>
            <li>
              <Icon name="bank" />
              <span>
                <b>{m.transfer}</b>
                <br />
                <span className="note">{m.transferText}</span>
              </span>
            </li>
            <li>
              <Icon name="chat" />
              <span>
                <b>{m.ussd}</b>
                <br />
                <span className="note">{m.ussdText}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
