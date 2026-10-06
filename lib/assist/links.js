import { siteAllowsOrigin } from "./sites";

// Which parts of an answer become links in the chat. Only the business's own websites (over
// https), wa.me with its own WhatsApp number, its phone (tel:) and its email (mailto:). Any
// other address or number stays plain text. Safe in the browser and on the server.

const TOKEN = /(https?:\/\/[^\s<>"'`]+)|([\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+)|(\+?\d[\d ()-]{5,}\d)/gu;

const digits = (s) => String(s || "").replace(/\D/g, "");

function urlHref(raw, s) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  if (siteAllowsOrigin(s.sites, url.origin)) return url.href;
  if (s.whatsapp && url.hostname === "wa.me" && url.pathname.replace(/\/+$/, "") === `/${s.whatsapp}`) return `https://wa.me/${s.whatsapp}`;
  return null;
}

function numberHref(raw, s) {
  const n = digits(raw);
  if (n.length < 7) return null;
  if (s.phone && n === digits(s.phone)) return `tel:${String(s.phone).trim().startsWith("+") ? "+" : ""}${n}`;
  if (s.whatsapp && n === s.whatsapp) return `https://wa.me/${s.whatsapp}`;
  return null;
}

// The text as parts: { text } for plain text, or { text, href, external } for a link. external
// is true for web links, which open in a new tab.
export function linkParts(text, settings = {}) {
  const s = {
    sites: Array.isArray(settings.sites) ? settings.sites : [],
    whatsapp: /^\d{8,15}$/.test(settings.whatsapp || "") ? settings.whatsapp : "",
    phone: settings.phone || "",
    email: String(settings.email || "").trim().toLowerCase(),
  };
  const str = String(text ?? "");
  const parts = [];
  let last = 0;
  for (const m of str.matchAll(TOKEN)) {
    let raw = m[0];
    if (m[1]) raw = raw.replace(/[.,;:!?)\]]+$/, "");
    let href = null;
    if (m[1]) href = urlHref(raw, s);
    else if (m[2]) href = s.email && raw.toLowerCase() === s.email ? `mailto:${s.email}` : null;
    else href = numberHref(raw, s);
    if (!href) continue;
    if (m.index > last) parts.push({ text: str.slice(last, m.index) });
    parts.push({ text: raw, href, external: href.startsWith("https:") });
    last = m.index + raw.length;
  }
  if (last < str.length) parts.push({ text: str.slice(last) });
  return parts;
}
