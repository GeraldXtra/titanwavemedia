"use client";

import { useState } from "react";
import Icon from "../Icon";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/products";

export default function NotifyToggle({ slug, name, on: first, main = false }) {
  const [on, setOn] = useState(first);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const { data } = await postJson("/api/console/interest", { product: slug, on: !on });
    setBusy(false);
    if (!data.ok) return;
    setOn(!on);
    toast(format(!on ? copy.doneOn : copy.doneOff, { name }));
  }

  return (
    <button className={`btn${main && !on ? " btn--solid" : ""}${main ? "" : " btn--sm"}`} type="button" aria-pressed={on ? "true" : "false"} onClick={toggle} disabled={busy} aria-busy={busy || undefined}>
      {on && <Icon name="check" />}
      {on ? copy.notified : copy.notify}
    </button>
  );
}
