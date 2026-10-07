const FLAG = "twm-remember";
const PREFIX = "twm-choice-";

export function remembering() {
  try {
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

export function setRemembering(on) {
  try {
    if (on) {
      localStorage.setItem(FLAG, "1");
      return;
    }
    localStorage.removeItem(FLAG);
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {}
}

export function loadChoice(name) {
  if (!remembering()) return null;
  try {
    return JSON.parse(localStorage.getItem(PREFIX + name) || "null");
  } catch {
    return null;
  }
}

export function saveChoice(name, value) {
  if (!remembering()) return;
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value));
  } catch {}
}
