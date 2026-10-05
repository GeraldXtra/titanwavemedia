import site from "@/content/site";

// Joins class names, skipping empty ones.
export function cx(...names) {
  return names.filter(Boolean).join(" ") || undefined;
}

const PLACEHOLDER = /^\[[^\]]*\]$/;

// True when the whole text is a placeholder like "[Client name]".
export function isPh(text) {
  return typeof text === "string" && PLACEHOLDER.test(text.trim());
}

// The "ph" class for an element whose whole text is a placeholder.
export function ph(text, ...classes) {
  return cx(...classes, isPh(text) && "ph");
}

// Values that {curly brackets} in the content are replaced with.
const TOKENS = {
  email: site.email,
  phone: site.phone,
  rc: site.rc,
  setupPrice: site.prices.setup,
  carePrice: site.prices.care,
  location: site.location,
};

export function fill(text) {
  return String(text).replace(/\{(\w+)\}/g, (match, key) => (key in TOKENS ? TOKENS[key] : match));
}

// Fills {tokens} with the given values, for messages like "{n} rows, {f} fields."
export function format(text, values) {
  return String(text).replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}

// Internal links go through the Next.js router; anything with a scheme opens as a normal link.
export function isExternal(href) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href || "");
}

// Where the email address and social links in the footer point.
export function emailHref(email) {
  return isPh(email) ? "/contact" : `mailto:${email}`;
}

// An exact match in any case, for a database "ilike" filter: its wildcards are escaped.
export function likeExact(text) {
  return String(text).replace(/[\\%_]/g, (c) => "\\" + c);
}
