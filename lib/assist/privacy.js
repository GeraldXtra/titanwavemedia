const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu;
const LONG_NUMBER = /\+?\d(?:[ \t-]*\d){9,}/g;

export function hideDetails(text) {
  return String(text ?? "")
    .replace(/\u0000/g, "")
    .replace(EMAIL, "(email hidden)")
    .replace(LONG_NUMBER, "(number hidden)");
}

export function questionKey(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .slice(0, 200)
    .trim();
}
