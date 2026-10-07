"use client";

import { useState } from "react";
import { postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import copy from "@/content/console/settings";

const n = copy.notifications;

export default function EmailPrefs({ prefs }) {
  const [v, setV] = useState(prefs);

  async function change(key, on) {
    setV((old) => ({ ...old, [key]: on }));
    const { data } = await postJson("/api/console/prefs", { key, on });
    if (data.ok) toast(copy.saved);
    else {
      setV((old) => ({ ...old, [key]: !on }));
      toast(copy.failed);
    }
  }

  return (
    <div className="c-card" style={{ maxWidth: 720 }}>
      <h2>{n.title}</h2>
      {Object.entries(n.items).map(([key, item]) => (
        <div className="c-toggle" key={key}>
          <span className="c-toggle__text">
            <b id={`np-${key}`}>{item.label}</b>
            <small id={`np-${key}-help`}>{item.help}</small>
          </span>
          <label className="switch">
            <input type="checkbox" role="switch" checked={v[key]} onChange={(e) => change(key, e.target.checked)} aria-labelledby={`np-${key}`} aria-describedby={`np-${key}-help`} />
            <span className="switch__track" aria-hidden="true" />
          </label>
        </div>
      ))}
      <p className="note" style={{ marginTop: 12 }}>
        {n.note}
      </p>
    </div>
  );
}
