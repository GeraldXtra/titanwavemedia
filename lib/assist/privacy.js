// Keeping customers' details out of what Wave Assist keeps and sends to the AI model. Applied to
// the customer's words before they are kept or sent anywhere.

const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu;
// 10 or more digits in a run, with spaces or dashes allowed between them: phone, card and
// account numbers. Shorter numbers, like prices, dates and times, stay.
const LONG_NUMBER = /\+?\d(?:[ \t-]*\d){9,}/g;

// Email addresses become "(email hidden)" and long numbers "(number hidden)". Also drops the
// characters a database cannot keep.
export function hideDetails(text) {
  return String(text ?? "")
    .replace(/\u0000/g, "")
    .replace(EMAIL, "(email hidden)")
    .replace(LONG_NUMBER, "(number hidden)");
}

// The question in a plain form, so the same question asked in different ways groups together:
// lowercase letters, digits and single spaces, at most 200 characters.
export function questionKey(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .slice(0, 200)
    .trim();
}
