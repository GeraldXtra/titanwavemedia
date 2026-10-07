import site from "@/content/site";

export function cx(...names) {
  return names.filter(Boolean).join(" ") || undefined;
}

const PLACEHOLDER = /^\[[^\]]*\]$/;

export function isPh(text) {
  return typeof text === "string" && PLACEHOLDER.test(text.trim());
}

export function ph(text, ...classes) {
  return cx(...classes, isPh(text) && "ph");
}

const realPrice = (value) => typeof value === "string" && !isPh(value) && /\d/.test(value);

export function pricesReady() {
  return realPrice(site.prices.setup) && realPrice(site.prices.care);
}

const PRICE_TOKEN = /\{(setupPrice|carePrice)\}/;

const TOKENS = {
  email: site.email,
  phone: site.phone,
  rc: site.rc,
  setupPrice: site.prices.setup,
  carePrice: site.prices.care,
  location: site.location,
};

export function fill(text) {
  const s = String(text);
  if (PRICE_TOKEN.test(s) && !pricesReady()) return site.prices.quote;
  return s.replace(/\{(\w+)\}/g, (match, key) => (key in TOKENS ? TOKENS[key] : match));
}

export function format(text, values) {
  return String(text).replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}

export function isExternal(href) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href || "");
}

export function emailHref(email) {
  return isPh(email) ? "/contact" : `mailto:${email}`;
}

export function likeExact(text) {
  return String(text).replace(/[\\%_]/g, (c) => "\\" + c);
}
