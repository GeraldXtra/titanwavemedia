import "server-only";
import { json, readJson } from "../http";
import { sameOrigin } from "../security";
import { getAdmin } from "../supabase";
import { readToken } from "./token";

// The start of every call from the chat page to /api/assist/: it must come from our own pages
// (the chat page runs on our address, inside the business's website), with a small JSON body
// and, except for config, a good token. Returns { data, token } or { res } to send back.
// A missing or old token is answered 401 { error: "token" }, so the page fetches a fresh one
// from config and tries once more.
export async function chatRequest(request, max, { token: needToken = true } = {}) {
  if (!sameOrigin(request)) return { res: json({ ok: false, error: "forbidden" }, 403) };
  if (!getAdmin()) return { res: json({ ok: false, error: "off" }, 503) };
  const body = await readJson(request, max);
  if (body.error) return { res: json({ ok: false, error: body.error }, body.error === "too_large" ? 413 : 400) };
  const data = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : null;
  if (!data) return { res: json({ ok: false, error: "invalid" }, 400) };
  if (!needToken) return { data };
  const token = readToken(data.token);
  if (!token) return { res: json({ ok: false, error: "token" }, 401) };
  return { data, token };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function uuidOrNull(value) {
  return typeof value === "string" && UUID.test(value) ? value : null;
}

// A conversation stays open for 24 hours after its last message, until Start again.
export const OPEN_FOR_MS = 24 * 60 * 60 * 1000;

export function isOpen(conversation, now = Date.now()) {
  return Boolean(conversation && !conversation.ended_at && now - Date.parse(conversation.last_message_at) < OPEN_FOR_MS);
}

// One conversation of this assistant, or null.
export async function loadConversation(assistantId, conversationId) {
  const id = uuidOrNull(conversationId);
  if (!id) return null;
  const { data, error } = await getAdmin()
    .from("assist_conversations")
    .select("id, assistant_id, business_id, created_at, last_message_at, message_count, outcome, over_limit, ended_at")
    .eq("id", id)
    .eq("assistant_id", assistantId)
    .maybeSingle();
  if (error) throw new Error(`assist conversation: ${error.message}`);
  return data || null;
}
