"use client";

import { useEffect } from "react";
import { applyTheme, readTheme, syncThemeColor, THEME_KEY } from "@/lib/theme";

export default function ThemeFollow() {
  useEffect(() => {
    syncThemeColor();
    const onStorage = (e) => {
      if (e.key === THEME_KEY || e.key === null) applyTheme(readTheme());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
