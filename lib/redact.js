// Simple rules that find the obvious personal details in a message: emails, phone numbers,
// ten digit account numbers and names that follow "this is", "my name is", "I am" or "name:".
// The home page privacy demo shows them working, and the assistant's saved conversations go
// through the same rules before they are stored.
//
// A number with exactly ten digits is an account number and one with more is a phone number.
// Shorter numbers (dates, amounts) are left alone, and an email stops at the end of its domain
// so a full stop after it stays in the sentence.

const RULES = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(\+?\d[\d\s-]{8,}\d)|((?:this is|my name is|i am|i'm|name:)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;

// Returns the message as parts ({ text } or { kind }) and how many of each kind came out.
export function redactParts(text) {
  const re = new RegExp(RULES.source, RULES.flags);
  const parts = [];
  const counts = { NAME: 0, EMAIL: 0, PHONE: 0, ACCOUNT: 0 };
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    if (m[1]) {
      counts.EMAIL++;
      parts.push({ kind: "EMAIL" });
    } else if (m[2]) {
      const digits = m[2].replace(/\D/g, "");
      if (digits.length === 10) {
        counts.ACCOUNT++;
        parts.push({ kind: "ACCOUNT" });
      } else if (digits.length > 10) {
        counts.PHONE++;
        parts.push({ kind: "PHONE" });
      } else {
        parts.push({ text: m[2] });
      }
    } else {
      counts.NAME++;
      parts.push({ text: m[3] });
      parts.push({ kind: "NAME" });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return { parts, counts };
}

// The message with [NAME], [PHONE], [ACCOUNT] and [EMAIL] in place of the details.
export function redactText(text) {
  return redactParts(String(text))
    .parts.map((p) => (p.kind ? `[${p.kind}]` : p.text))
    .join("");
}
