export const MAX_SITES = 20;

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function cleanSite(input) {
  let s = String(input ?? "").toLowerCase().replace(/\s+/g, "");
  if (!s) return { ok: false, error: "empty" };
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
