"use client";

import { useEffect, useState } from "react";
import { applyTheme, readTheme, syncThemeColor, THEME_EVENT, THEME_KEY } from "@/lib/theme";
import { cx } from "@/lib/text";
import site from "@/content/site";

export default function ThemeSwitch({ className, labelledBy }) {
  const t = site.theme;
  const [pick, setPick] = useState(null);

  useEffect(() => {
    setPick(readTheme());
    syncThemeColor();
    const onPick = (e) => setPick(e.detail);
    const onStorage = (e) => {
      if (e.key === THEME_KEY || e.key === null) applyTheme(readTheme());
    };
    window.addEventListener(THEME_EVENT, onPick);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, onPick);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div className={cx("theme", className)} role="group" {...(labelledBy ? { "aria-labelledby": labelledBy } : { "aria-label": t.label })}>
      {t.options.map((o) => (
        <button key={o.value} type="button" aria-pressed={pick === o.value ? "true" : "false"} onClick={() => applyTheme(o.value)}>
          <svg aria-hidden="true">
            <use href={`#i-theme-${o.value}`} />
          </svg>
          {o.label}
        </button>
      ))}
    </div>
  );
}
