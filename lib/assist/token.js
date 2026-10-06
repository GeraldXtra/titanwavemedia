import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// The short lived token the chat page gets from /api/assist/config and sends with every chat
// call. It says which assistant the chat is for, so the chat API never trusts an id the page
// sends on its own. It is signed with a key made from a secret the server already has, so it
// needs no new setting.
//
// The token is base64url(payload).signature. The payload:
// { a: assistant id, b: business id, p: public id, t: 1 for a test chat, e: expiry in seconds }.

const LABEL = "wave-assist-token-v1";
export const CHAT_SECONDS = 60 * 60;
export const TEST_SECONDS = 2 * 60 * 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PUBLIC_ID = /^[a-z0-9]{8,32}$/;

function key() {
  const secret = process.env.SUPABASE_SERVICE_KEY || process.env.CRON_SECRET;
  return secret ? createHmac("sha256", secret).update(LABEL).digest() : null;
}

function sign(text, k) {
  return createHmac("sha256", k).update(text).digest("base64url");
}

// A token for `payload` that lasts `seconds`, or null when the server has no secret yet.
export function signToken(payload, seconds) {
  const k = key();
  if (!k) return null;
  const body = Buffer.from(JSON.stringify({ ...payload, e: Math.floor(Date.now() / 1000) + seconds })).toString("base64url");
  return `${body}.${sign(body, k)}`;
}

// The payload of a good token that has not run out, or null.
export function readToken(token) {
  const k = key();
  if (!k || typeof token !== "string" || token.length > 600) return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const want = Buffer.from(sign(body, k));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  let p;
  try {
    p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!p || typeof p !== "object" || !UUID.test(p.a) || !UUID.test(p.b) || !PUBLIC_ID.test(p.p)) return null;
  if (!Number.isInteger(p.e) || p.e <= Date.now() / 1000) return null;
  return { a: p.a, b: p.b, p: p.p, t: p.t === 1 ? 1 : 0, e: p.e };
}

// The token for a chat on a business's website: 1 hour.
export function chatToken(assistant) {
  return signToken({ a: assistant.id, b: assistant.business_id, p: assistant.public_id }, CHAT_SECONDS);
}

// The token for the test chat in the console: 2 hours. The console puts it in the test chat's
// address: /assist/chat?id={public_id}&test={token}.
export function testToken(assistant) {
  return signToken({ a: assistant.id, b: assistant.business_id, p: assistant.public_id, t: 1 }, TEST_SECONDS);
}
