import { isEmail } from "../validate";
import { buttonColors, contrast } from "./color";
import { cleanSites } from "./sites";

// The checks for Wave Assist's setup form. Safe in the browser and on the server: the console
// form runs them as people type, and the server runs them again before it saves anything.
// Errors are short codes; their words are in content/console/assist.js, setup.errors.

// The most each field may hold. The database checks the same limits.
export const MAX = {
  name: 120,
  sells: 2000,
  prices: 10000,
  hours: 1000,
  areas: 1000,
  phone: 40,
  email: 254,
  question: 300,
  answer: 2000,
  extra: 20000,
  greeting: 300,
  starter: 150,
};
export const MAX_QA = 50;
export const MAX_STARTERS = 4;

const text = (v) => (typeof v === "string" ? v.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim() : "");
const line = (v) => text(v).replace(/\s+/g, " ");

// A WhatsApp number as digits with the country code, the way wa.me links need it. A Nigerian
// number written with its leading 0, like 0803..., becomes 234803.... "+" and "00" before the
// country code are dropped. Returns "" for nothing typed, or null when it can't be a number.
export function cleanWhatsapp(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (/^0\d{10}$/.test(digits)) digits = `234${digits.slice(1)}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

// A phone number for people to read: digits, spaces and a plus sign. Brackets, dots and dashes
// become spaces. Returns "" for nothing typed, or null when it isn't a phone number.
export function cleanPhone(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  const s = raw.replace(/[().-]/g, " ").replace(/\s+/g, " ").trim();
  const digits = s.replace(/\D/g, "").length;
  if (s.length > MAX.phone || !/^\+?[\d ]+$/.test(s) || digits < 7 || digits > 15) return null;
  return s;
}

// Everything the form sends, checked and cleaned. Returns { ok, values, errors }:
// - values: what to save, with the button colour already moved to reach 4.6:1 when it had to be,
//   and textColor set to white or black.
// - errors: { field: code }. For the questions and answers, errors.qa is { index: code }; for the
//   websites, errors.sites is [{ input, error }] from cleanSites.
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

  // Questions and answers: empty pairs are dropped, half filled ones are refused.
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

  return { ok: Object.keys(errors).length === 0, values, errors };
}

// What the form shows under the colour: the colour that will be used, its text colour, the
// contrast between them, and whether the colour had to move to reach 4.6:1.
export function colorReport(input) {
  const c = buttonColors(input);
  if (!c) return null;
  const ratio = Math.floor(contrast(c.color, c.text) * 10) / 10;
  return { ...c, ratio, way: c.adjusted ? (c.text === "#ffffff" ? "darker" : "lighter") : null };
}
