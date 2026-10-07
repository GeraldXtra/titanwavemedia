"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/client";
import { toast } from "@/lib/toast";
import copy from "@/content/console/assist";

const s = copy.switch;

export default function AssistSwitch({ on: first, hasSites, hasReach = true, business }) {
  const router = useRouter();
  const [on, setOn] = useState(first);
  const [busy, setBusy] = useState(false);

  async function change(next) {
    setBusy(true);
    const { data } = await postJson("/api/console/assist/switch", { on: next, ...(business ? { business } : {}) });
    setBusy(false);
    if (!data.ok) return toast(data.message || copy.failed);
    setOn(next);
    toast(data.message);
    router.refresh();
  }

  return (
    <div className="c-card as-switch">
      <div className="c-toggle">
        <span className="c-toggle__text">
          <b id="as-on-label">{s.label}</b>
          <small id="as-on-line">
            {on ? s.on : s.off}
            {on && !hasSites ? ` ${s.noSites}` : ""}
            {!on && !hasReach ? ` ${s.noReach}` : ""}
          </small>
        </span>
        <label className="switch">
          <input
            type="checkbox"
            role="switch"
            checked={on}
            aria-checked={on ? "true" : "false"}
            disabled={busy || (!on && !hasReach)}
            onChange={(e) => change(e.target.checked)}
            aria-labelledby="as-on-label"
            aria-describedby="as-on-line"
          />
          <span className="switch__track" aria-hidden="true" />
        </label>
      </div>
    </div>
  );
}
