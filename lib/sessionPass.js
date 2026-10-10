import { setting } from "./settings.mjs";

export const PASS_HEADER = "x-twm-session";
export const PATH_HEADER = "x-twm-path";

const KEEP = ["sub", "email", "aal", "amr", "session_id", "exp", "iat", "role", "is_anonymous"];
const MAX_AGE = 60 * 1000;
const encoder = new TextEncoder();
let held = { secret: "", key: null };

async function passKey() {
  const secret = setting("SUPABASE_SERVICE_KEY");
  if (!secret) return null;
  if (held.secret !== secret) {
    const raw = await crypto.subtle.digest("SHA-256", encoder.encode(`titanwave-session-pass:${secret}`));
    const key = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
    held = { secret, key };
  }
  return held.key;
}

function toText(bytes) {
  let out = "";
  for (const b of new Uint8Array(bytes)) out += String.fromCharCode(b);
  return btoa(out).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toBytes(text) {
  return Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
}

export async function makePass(claims) {
  const key = await passKey();
  if (!key) return "";
  const kept = claims ? Object.fromEntries(KEEP.filter((k) => claims[k] !== undefined).map((k) => [k, claims[k]])) : null;
  const body = toText(encoder.encode(JSON.stringify({ c: kept, t: Date.now() })));
  const sig = toText(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
  return `${body}.${sig}`;
}

export async function readPass(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const key = await passKey();
  if (!key) return null;
  try {
    if (!(await crypto.subtle.verify("HMAC", key, toBytes(parts[1]), encoder.encode(parts[0])))) return null;
    const { c, t } = JSON.parse(new TextDecoder().decode(toBytes(parts[0])));
    if (typeof t !== "number" || Math.abs(Date.now() - t) > MAX_AGE) return null;
    return { claims: c && typeof c === "object" && typeof c.sub === "string" ? c : null };
  } catch {
    return null;
  }
}
