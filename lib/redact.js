const RULES = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(\+?\d[\d\s-]{8,}\d)|((?:this is|my name is|i am|i'm|name:)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;

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
      parts.push({ kind: "EMAIL", text: m[1] });
    } else if (m[2]) {
      const digits = m[2].replace(/\D/g, "");
      if (digits.length === 10) {
        counts.ACCOUNT++;
        parts.push({ kind: "ACCOUNT", text: m[2] });
      } else if (digits.length > 10) {
        counts.PHONE++;
        parts.push({ kind: "PHONE", text: m[2] });
      } else {
        parts.push({ text: m[2] });
      }
    } else {
      counts.NAME++;
      parts.push({ text: m[3] });
      parts.push({ kind: "NAME", text: m[4] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return { parts, counts };
}

export function redactText(text) {
  return redactParts(String(text))
    .parts.map((p) => (p.kind ? `[${p.kind}]` : p.text))
    .join("");
}
