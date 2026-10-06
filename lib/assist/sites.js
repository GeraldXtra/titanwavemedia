// The websites a Wave Assist chat may run on. Safe in the browser and on the server: the console
// cleans what people type with it, the chat page checks the parent page with it, and proxy.js
// builds the frame-ancestors rule from it.
//
// A site is a host name with an optional port, lowercase, without "www.": "shop.com",
// "shop.com:8443" or "localhost:3201". Real sites count over https only, and both
// https://shop.com and https://www.shop.com match "shop.com". localhost counts over http only.
// A site with no port matches only the default port.

export const MAX_SITES = 20;

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

// The words for these codes are in content/console/assist.js.
// empty: nothing typed. not_host: not a host name. ip: an IP address. single: one word, like
// "shop", which is not a website. port: a port outside 1 to 65535. too_many: more than 20.

// { ok: true, site } or { ok: false, error } for one thing a person typed.
export function cleanSite(input) {
  let s = String(input ?? "").toLowerCase().replace(/\s+/g, "");
  if (!s) return { ok: false, error: "empty" };
  // A scheme, a path, a query, a hash and any user name before the host all go.
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").replace(/^\/\//, "");
  s = s.split(/[/?#\\]/)[0];
  s = s.slice(s.lastIndexOf("@") + 1);
  if (!s) return { ok: false, error: "not_host" };
  if (s.startsWith("[") || (s.match(/:/g) || []).length > 1) return { ok: false, error: "ip" };

  let host = s;
  let port = "";
  const colon = s.indexOf(":");
  if (colon >= 0) {
    host = s.slice(0, colon);
    port = s.slice(colon + 1);
    if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) return { ok: false, error: "port" };
    port = String(Number(port));
  }
  host = host.replace(/\.+$/, "");
  if (!host) return { ok: false, error: "not_host" };

  // Names in other scripts become their xn-- form, the way browsers send them.
  let ascii;
  try {
    ascii = new URL(`http://${host}`).hostname;
  } catch {
    return { ok: false, error: "not_host" };
  }
  ascii = ascii.replace(/\.+$/, "");
  if (/^\d+(\.\d+){3}$/.test(ascii) || ascii.startsWith("[") || /^[\d.]+$/.test(host)) return { ok: false, error: "ip" };

  if (ascii === "localhost") {
    if (port === "80") port = "";
    return { ok: true, site: port ? `localhost:${port}` : "localhost" };
  }

  const labels = ascii.split(".");
  if (labels.length >= 3 && labels[0] === "www") labels.shift();
  if (labels.length < 2) return { ok: false, error: "single" };
  if (ascii.length > 253 || !labels.every((l) => LABEL.test(l))) return { ok: false, error: "not_host" };
  if (!/[a-z]/.test(labels[labels.length - 1])) return { ok: false, error: "not_host" };
  if (port === "443") port = "";
  const name = labels.join(".");
  return { ok: true, site: port ? `${name}:${port}` : name };
}

// Cleans a list (an array, or text with one site a line or separated by commas). Repeats are
// dropped. Returns { ok, sites, errors }, where errors is [{ input, error }] and ok is true only
// when there are none.
export function cleanSites(list) {
  const items = Array.isArray(list) ? list : String(list ?? "").split(/[\n,]+/);
  const sites = [];
  const errors = [];
  for (const raw of items) {
    if (!String(raw ?? "").trim()) continue;
    const r = cleanSite(raw);
    if (!r.ok) errors.push({ input: String(raw).trim(), error: r.error });
    else if (!sites.includes(r.site)) sites.push(r.site);
  }
  if (sites.length > MAX_SITES) errors.push({ input: "", error: "too_many" });
  return { ok: errors.length === 0, sites: sites.slice(0, MAX_SITES), errors };
}

export function isLocal(site) {
  return site === "localhost" || String(site).startsWith("localhost:");
}

function split(site) {
  const i = site.indexOf(":");
  return i < 0 ? { host: site, port: "" } : { host: site.slice(0, i), port: site.slice(i + 1) };
}

// Whether a page at `origin` (like "https://www.shop.com") is one of the sites.
export function siteAllowsOrigin(sites, origin) {
  if (!Array.isArray(sites) || !sites.length || typeof origin !== "string") return false;
  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.origin !== origin.replace(/\/+$/, "")) return false;
  return sites.some((raw) => {
    const r = cleanSite(raw);
    if (!r.ok) return false;
    const { host, port } = split(r.site);
    if (url.port !== port) return false;
    if (isLocal(r.site)) return url.protocol === "http:" && url.hostname === "localhost";
    return url.protocol === "https:" && (url.hostname === host || url.hostname === `www.${host}`);
  });
}

// The sources for a frame-ancestors rule, like "https://shop.com https://www.shop.com
// http://localhost:3201". Without 'self': whoever builds the rule adds it.
export function frameAncestors(sites) {
  const out = [];
  for (const raw of Array.isArray(sites) ? sites : []) {
    const r = cleanSite(raw);
    if (!r.ok) continue;
    const { host, port } = split(r.site);
    const p = port ? `:${port}` : "";
    if (isLocal(r.site)) out.push(`http://localhost${p}`);
    else out.push(`https://${host}${p}`, `https://www.${host}${p}`);
  }
  return [...new Set(out)].join(" ");
}
