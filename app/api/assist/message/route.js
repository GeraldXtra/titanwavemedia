import { answer, setReply, usesModel } from "@/lib/assist/engine";
import { hideDetails } from "@/lib/assist/privacy";
import { chatRequest, uuidOrNull } from "@/lib/assist/request";
import { loadAssistant } from "@/lib/assist/store";
import { ASSIST_LIMITS, beginTurn, finishTurn } from "@/lib/assist/turns";
import { clientIp, json, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY = 48 * 1024;
const MAX_TEXT = 1000;
const HISTORY = 12;

function testHistory(list) {
  if (!Array.isArray(list)) return [];
  return list
    .slice(-60)
    .filter((m) => m && (m.role === "customer" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
    .map((m) => ({ role: m.role, text: (m.role === "customer" ? hideDetails(m.text) : m.text).slice(0, 2000) }));
}

async function recentMessages(conversationId) {
  const { data, error } = await getAdmin()
    .from("assist_messages")
    .select("role, body")
    .eq("conversation_id", conversationId)
    .order("id", { ascending: false })
    .limit(HISTORY);
  if (error) throw new Error(`assist history: ${error.message}`);
  return (data || []).reverse().map((m) => ({ role: m.role, text: m.body }));
}

function limitReply(kind, assistant) {
  return { text: setReply(kind, assistant), answered: null, handover: true, source: "limit" };
}

const send = (conversationId, reply, limited = null) =>
  json({ ok: true, conversationId, reply: { text: reply.text, answered: reply.answered === true, handover: Boolean(reply.handover) }, limited });

export async function POST(request) {
  const { data, token, res } = await chatRequest(request, MAX_BODY);
  if (res) return res;
  const raw = str(data.text).replace(/\u0000/g, "").trim();
  if (!raw) return json({ ok: false, error: "empty" }, 400);
  if (raw.length > MAX_TEXT) return json({ ok: false, error: "too_long" }, 400);
  const test = token.t === 1;

  try {
    const assistant = await loadAssistant(token.p, { fresh: test });
    if (!assistant || assistant.id !== token.a) return json({ ok: false, error: "token" }, 401);
    const question = hideDetails(raw);

    if (!test && !assistant.is_on) return send(null, { text: setReply("off", assistant), answered: null, handover: true }, "off");

    const history = test ? testHistory(data.history) : null;
    if (test && history.filter((m) => m.role === "customer").length >= ASSIST_LIMITS.conversation) {
      return send(null, limitReply("conversation", assistant), "conversation");
    }

    const begin = await beginTurn({
      assistant,
      conversationId: test ? null : uuidOrNull(data.conversationId),
      ip: clientIp(request),
      question,
      test,
      model: usesModel(),
    });
    if (!begin || !begin.ok) return json({ ok: false, error: "token" }, 401);
    const limited = begin.limited || null;

    if (limited === "visitor" || limited === "conversation") return send(begin.conversation_id || null, limitReply(limited, assistant), limited);
    if (limited === "starts") return send(null, limitReply("starts", assistant), "starts");

    if (test) {
      if (limited === "test") return send(null, { text: setReply("test", assistant), answered: null, handover: false }, "test");
      return send(null, await answer({ assistant, history: history.slice(-HISTORY), question, test: true }));
    }

    const conversationId = begin.conversation_id;
    let reply;
    if (limited === "month" || limited === "day") {
      reply = limitReply("limit", assistant);
    } else {
      const before = begin.new ? [] : await recentMessages(conversationId);
      reply = await answer({ assistant, history: before, question, conversationId });
    }
    const kept = await finishTurn(assistant.id, conversationId, question, reply);
    if (!kept || !kept.ok) throw new Error(`assist turn: ${kept ? kept.error : "nothing kept"}`);
    return send(conversationId, reply, limited);
  } catch (error) {
    console.error("[assist] message:", error.message);
    return json({ ok: false, error: "failed" }, 500);
  }
}
