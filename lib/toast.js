// A short message at the bottom of the console, like "Saved." The console shell shows it and
// screen readers hear it.
export function toast(message) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("twm-toast", { detail: String(message || "") }));
}
