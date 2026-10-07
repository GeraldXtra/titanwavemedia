export const THEME_KEY = "twm-theme";
export const THEME_EVENT = "twm-theme";
export const THEME_COLORS = { light: "#FFFFFF", dark: "#151514" };
const PICKS = ["system", "light", "dark"];

export const THEME_SCRIPT = `(function(){var d=document.documentElement;if(location.pathname.indexOf("/assist/")===0)return;var p=null;try{p=localStorage.getItem("${THEME_KEY}")}catch(e){}if(p==="light"||p==="dark"){d.setAttribute("data-theme",p);d.setAttribute("data-theme-pick",p)}else{d.removeAttribute("data-theme");d.setAttribute("data-theme-pick","system")}})();`;

export function readTheme() {
  try {
    const p = window.localStorage.getItem(THEME_KEY);
    return PICKS.includes(p) ? p : "system";
  } catch {
    return "system";
  }
}

export function isDark() {
  const t = document.documentElement.getAttribute("data-theme");
  if (t) return t === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function syncThemeColor() {
  const t = document.documentElement.getAttribute("data-theme");
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    if (m.dataset.twmMedia === undefined) m.dataset.twmMedia = m.getAttribute("media") || "";
    const dark = t ? t === "dark" : m.dataset.twmMedia.includes("dark");
    m.setAttribute("content", dark ? THEME_COLORS.dark : THEME_COLORS.light);
  });
}

export function applyTheme(pick) {
  const value = PICKS.includes(pick) ? pick : "system";
  const d = document.documentElement;
  try {
    if (value === "system") window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, value);
  } catch {}
  if (value === "system") d.removeAttribute("data-theme");
  else d.setAttribute("data-theme", value);
  d.setAttribute("data-theme-pick", value);
  syncThemeColor();
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: value }));
}
