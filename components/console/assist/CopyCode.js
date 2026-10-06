"use client";

import { useRef } from "react";
import Icon from "../../Icon";
import { toast } from "@/lib/toast";
import copy from "@/content/console/assist";

const t = copy.install;

// The install code, with a copy button. Where the browser won't copy, the code is selected so
// it can be copied with the keyboard.
export default function CopyCode({ code }) {
  const box = useRef(null);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      toast(t.copied);
    } catch {
      if (box.current) {
        box.current.focus();
        box.current.select();
      }
      toast(t.copyFailed);
    }
  }

  return (
    <div className="as-codewrap">
      <label className="as-codewrap__label" htmlFor="as-code">
        {t.codeLabel}
      </label>
      <textarea id="as-code" ref={box} className="as-code" readOnly value={code} rows={3} spellCheck={false} onFocus={(e) => e.target.select()} />
      <div className="btns">
        <button className="btn btn--solid" type="button" onClick={onCopy}>
          <Icon name="code" />
          {t.copy}
        </button>
      </div>
    </div>
  );
}
