import { isEmail } from "../validate";
import { buttonColors, contrast } from "./color";
import { cleanSites } from "./sites";

export const MAX = {
  name: 120,
  sells: 2000,
  prices: 50000,
  hours: 1000,
  areas: 1000,
  phone: 40,
  email: 254,
  question: 300,
  answer: 2000,
  extra: 50000,
  docName: 200,
  docText: 50000,
  greeting: 300,
  starter: 150,
};
export const MAX_QA = 50;
export const MAX_DOCS = 5;
export const MAX_KNOWLEDGE = 50000;

const len = (v) => (typeof v === "string" ? v.length : 0);

export function knowledgeSize(v) {
  if (!v) return 0;
  const qa = (Array.isArray(v.qa) ? v.qa : []).reduce((n, p) => n + (p ? len(p.q) + len(p.a) : 0), 0);
  const docs = (Array.isArray(v.docs) ? v.docs : []).reduce((n, d) => n + (d ? len(d.text) : 0), 0);
  return len(v.name) + len(v.sells) + len(v.prices) + len(v.hours) + len(v.areas) + len(v.extra) + qa + docs;
}

export const hasReach = (v) => Boolean(v && (String(v.whatsapp || "").trim() || String(v.phone || "").trim() || String(v.email || "").trim()));
export const MAX_STARTERS = 4;

const text = (v) => (typeof v === "string" ? v.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim() : "");
const line = (v) => text(v).replace(/\s+/g, " ");

export function cleanWhatsapp(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (/^0\d{10}$/.test(digits)) digits = `234${digits.slice(1)}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export function cleanPhone(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  const s = raw.replace(/[().-]/g, " ").replace(/\s+/g, " ").trim();
  const digits = s.replace(/\D/g, "").length;
  if (s.length > MAX.phone || !/^\+?[\d ]+$/.test(s) || digits < 7 || digits > 15) return null;
  return s;
}

export function checkSetup(input = {}) {
  const errors = {};
  const values = {};

  for (const k of ["name", "hours", "areas"]) values[k] = line(input[k]);
  for (const k of ["sells", "prices", "extra", "greeting"]) values[k] = text(input[k]);
  values.greeting = values.greeting.replace(/\s+/g, " ");
  for (const k of ["name", "sells", "prices", "hours", "areas", "extra", "greeting"]) {
    if (values[k].length > MAX[k]) errors[k] = "long";
  }

  const whatsapp = cleanWhatsapp(input.whatsapp);
  if (whatsapp === null) errors.whatsapp = "whatsapp";
  values.whatsapp = whatsapp || "";
  const phone = cleanPhone(input.phone);
  if (phone === null) errors.phone = "phone";
  values.phone = phone || "";
  values.email = text(input.email);
  if (values.email && !isEmail(values.email)) errors.email = "email";

  const qaErrors = {};
  const qa = [];
  const pairs = Array.isArray(input.qa) ? input.qa : [];
  pairs.forEach((p, i) => {
    const q = line(p && p.q);
    const a = text(p && p.a);
    if (!q && !a) return;
    if (!q || !a) qaErrors[i] = "half";
    else if (q.length > MAX.question || a.length > MAX.answer) qaErrors[i] = "long";
    qa.push({ q, a });
  });
  if (Object.keys(qaErrors).length) errors.qa = qaErrors;
  else if (qa.length > MAX_QA) errors.qaCount = "many";
  values.qa = qa;

  const docs = [];
  const docErrors = {};
  (Array.isArray(input.docs) ? input.docs : []).forEach((d, i) => {
    const name = line(d && d.name).slice(0, MAX.docName);
    const body = text(d && d.text);
    if (!name || !body) docErrors[i] = "docEmpty";
    else if (body.length > MAX.docText) docErrors[i] = "long";
    const added = d && typeof d.added === "string" && /^\d{4}-\d{2}-\d{2}T/.test(d.added) ? d.added : new Date().toISOString();
    docs.push({ name: name || "Document", text: body, chars: body.length, added });
  });
  if (Object.keys(docErrors).length) errors.docs = docErrors;
  else if (docs.length > MAX_DOCS) errors.docsCount = "many";
  values.docs = docs;

  const starters = (Array.isArray(input.starters) ? input.starters : []).map(line).filter(Boolean);
  if (starters.length > MAX_STARTERS) errors.starters = "many";
  else if (starters.some((s) => s.length > MAX.starter)) errors.starters = "long";
  values.starters = [...new Set(starters)];

  const colors = buttonColors(input.color);
  if (!colors) errors.color = "color";
  else {
    values.color = colors.color;
    values.textColor = colors.text;
  }
  if (input.corner !== "right" && input.corner !== "left") errors.corner = "corner";
  values.corner = input.corner === "left" ? "left" : "right";

  const sites = cleanSites(Array.isArray(input.sites) ? input.sites : []);
  if (!sites.ok) errors.sites = sites.errors;
  values.sites = sites.sites;

  if (knowledgeSize(values) > MAX_KNOWLEDGE) errors.knowledge = "knowledge";

  return { ok: Object.keys(errors).length === 0, values, errors };
}

export function colorReport(input) {
  const c = buttonColors(input);
  if (!c) return null;
  const ratio = Math.floor(contrast(c.color, c.text) * 10) / 10;
  return { ...c, ratio, way: c.adjusted ? (c.text === "#ffffff" ? "darker" : "lighter") : null };
}
