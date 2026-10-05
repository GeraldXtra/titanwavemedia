import "server-only";
import { createHash, createHmac, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { siteUrl } from "./seo";

const scryptAsync = promisify(scrypt);

// Actions that change something must come from this site's own pages. Browsers send Origin on
// every POST; a request from another site (or with no sign of where it came from) is refused.
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin) {
    let own = null;
    try {
      own = new URL(request.url).origin;
    } catch {}
    return origin === own || origin === new URL(siteUrl).origin;
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

export function sha256(text) {
  return createHash("sha256").update(String(text)).digest("hex");
}

// A keyed hash, for keeping emails and network addresses in the limit counts without keeping
// them readable.
export function keyHash(text) {
  const secret = process.env.SUPABASE_SERVICE_KEY || process.env.CRON_SECRET || "titan-wave";
  return createHmac("sha256", secret).update(String(text)).digest("hex");
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export function randomToken(bytes = 16) {
  return randomBytes(bytes).toString("hex");
}

// Backup codes for two step sign in: 8 characters with no look alike letters, shown as
// "abcd efgh". Kept only as slow salted hashes.
const CODE_LETTERS = "abcdefghjkmnpqrstuvwxyz23456789";

export function newBackupCodes(count = 10) {
  return Array.from({ length: count }, () => Array.from({ length: 8 }, () => CODE_LETTERS[randomInt(CODE_LETTERS.length)]).join(""));
}

export function showBackupCode(code) {
  return `${code.slice(0, 4)} ${code.slice(4)}`;
}

export function cleanBackupCode(input) {
  return String(input || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function hashBackupCode(code) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(cleanBackupCode(code), salt, 32);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function backupCodeMatches(code, stored) {
  const [kind, saltHex, hashHex] = String(stored).split("$");
  if (kind !== "scrypt" || !saltHex || !hashHex) return false;
  const hash = await scryptAsync(cleanBackupCode(code), Buffer.from(saltHex, "hex"), 32);
  return timingSafeEqual(hash, Buffer.from(hashHex, "hex"));
}

// The browser and the device, for the sign in history, from the browser's own description.
export function describeAgent(userAgent) {
  const ua = String(userAgent || "");
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /SamsungBrowser\//.test(ua)
        ? "Samsung Internet"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Firefox\//.test(ua)
            ? "Firefox"
            : /Safari\//.test(ua)
              ? "Safari"
              : null;
  const device = /Android/.test(ua)
    ? "Android"
    : /iPhone/.test(ua)
      ? "iPhone"
      : /iPad/.test(ua)
        ? "iPad"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS/.test(ua)
            ? "Mac"
            : /Linux|CrOS/.test(ua)
              ? "Linux"
              : null;
  return { browser, device };
}
