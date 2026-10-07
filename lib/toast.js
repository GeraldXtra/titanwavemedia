export function toast(message) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("twm-toast", { detail: String(message || "") }));
}
