import { answer, setReply, usesModel } from "@/lib/assist/engine";
import { hideDetails, questionKey } from "@/lib/assist/privacy";
import { chatRequest, isOpen, loadConversation } from "@/lib/assist/request";
import { dayStart, loadAssistant } from "@/lib/assist/store";
import { clientIp, json, str } from "@/lib/http";
import { check, hit } from "@/lib/limits";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY = 48 * 1024;
const MAX_TEXT = 1000;
// Customer messages in one conversation.
const PER_CONVERSATION = 30;
const HISTORY = 12;

function dailyLimit() {
  const n = Number(process.env.ASSIST_DAILY_LIMIT);
  return process.env.ASSIST_DAILY_LIMIT && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1000;
}

// Whether the AI model has answered ASSIST_DAILY_LIMIT times since midnight in Lagos, across
// every business. Test chats count too.
async function dayIsFull() {
  const { count, error } = await getAdmin().from("assist_usage").select("id", { count: "exact", head: true }).gte("created_at", dayStart());
  if (error) throw new Error(`assist usage: ${error.message}`);
  return (count || 0) >= dailyLimit();
}

// A test chat sends its own conversation: [{ role: "customer" | "assistant", text }].
function testHistory(list) {
  if (!Array.isArray(list)) return [];
  return list
    .slice(-60)
    .filter((m) => m && (m.role === "customer" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
    .map((m) => ({ role: m.role, text: (m.role === "customer" ? hideDetails(m.text) : m.text).slice(0, 2000) }));
}

// The conversation so far, for the AI model to read.
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

async function openConversation(assistantId, first) {
  const { data, error } = await getAdmin().rpc("assist_open_conversation", { p_assistant_id: assistantId, p_first: first.slice(0, 600) });
  if (error || !data || !data.ok) throw new Error(`assist open: ${error ? error.message : data && data.error}`);
  return { id: data.id, over_limit: data.over_limit, message_count: 0 };
}

async function addTurn(assistantId, conversationId, question, reply) {
  const { data, error } = await getAdmin().rpc("assist_add_turn", {
    p_assistant_id: assistantId,
    p_conversation_id: conversationId,
    p_customer: question,
    p_question_key: questionKey(question),
    p_reply: reply.text,
    p_answered: reply.answered,
    p_handover: reply.handover,
    p_source: reply.source,
  });
  if (error) throw new Error(`assist turn: ${error.message}`);
  return data;
}

function limitReply(kind, assistant) {
  return { text: setReply(kind, assistant), answered: null, handover: true, source: "limit" };
}

const send = (conversationId, reply, limited = null) =>
  json({ ok: true, conversationId, reply: { text: reply.text, answered: reply.answered === true, handover: Boolean(reply.handover) }, limited });

// A customer's message: { token, conversationId?, text }, or { token, history, text } in a test
// chat. Returns { ok, conversationId, reply: { text, answered, handover }, limited }, where
// limited is null, "visitor", "conversation", "month" or "day". When a limit is reached the
// reply only offers a person. Limits are checked in this order, before the AI model is asked:
// 30 messages an hour from one visitor, 30 messages in a conversation, the business's monthly
// conversations, and the daily safety limit on AI answers.
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

    // Switched off while the customer was chatting: nothing is kept, a person is offered.
    if (!test && !assistant.is_on) return send(null, { text: setReply("off", assistant), answered: null, handover: true });

    const visitorKey = `${assistant.id}:${clientIp(request)}`;
    const [visitor, found] = await Promise.all([check("assistVisitor", visitorKey), test ? null : loadConversation(assistant.id, data.conversationId)]);
    const current = isOpen(found) ? found : null;

    // 1. The visitor's hourly limit. Nothing is kept.
    if (!visitor.ok) return send(current ? current.id : null, limitReply("visitor", assistant), "visitor");

    if (test) {
      // A test chat keeps nothing but the usage row.
      const history = testHistory(data.history);
      if (history.filter((m) => m.role === "customer").length >= PER_CONVERSATION) {
        await hit("assistVisitor", visitorKey);
        return send(null, limitReply("conversation", assistant), "conversation");
      }
      const [, full] = await Promise.all([hit("assistVisitor", visitorKey), usesModel() ? dayIsFull() : false]);
      if (full) return send(null, limitReply("limit", assistant), "day");
      return send(null, await answer({ assistant, history: history.slice(-HISTORY), question, test: true }));
    }

    // 2. The conversation's limit. Nothing is kept; Start again opens a new one.
    if (current && current.message_count >= PER_CONVERSATION) {
      await hit("assistVisitor", visitorKey);
      return send(current.id, limitReply("conversation", assistant), "conversation");
    }

    // A new conversation starts with this message. 3. The monthly limit: a conversation that
    // starts over it only ever offers a person. 4. The daily safety limit, only when the AI
    // model would be asked. These reads do not depend on each other, so they run together.
    const [, conversation, history, dayFull] = await Promise.all([
      hit("assistVisitor", visitorKey),
      current || openConversation(assistant.id, question),
      current ? recentMessages(current.id) : [],
      usesModel() ? dayIsFull() : false,
    ]);

    let reply;
    let limited = null;
    if (conversation.over_limit) {
      reply = limitReply("limit", assistant);
      limited = "month";
    } else if (dayFull) {
      reply = limitReply("limit", assistant);
      limited = "day";
    } else {
      reply = await answer({ assistant, history, question, conversationId: conversation.id });
    }

    let kept = await addTurn(assistant.id, conversation.id, question, reply);
    let conversationId = conversation.id;
    if (!kept.ok) {
      // It closed in the meantime (Start again in another tab, or its last message): the turn
      // starts a new one.
      const next = await openConversation(assistant.id, question);
      kept = await addTurn(assistant.id, next.id, question, reply);
      if (!kept.ok) throw new Error(`assist turn: ${kept.error}`);
      conversationId = next.id;
    }
    return send(conversationId, reply, limited);
  } catch (error) {
    console.error("[assist] message:", error.message);
    return json({ ok: false, error: "failed" }, 500);
  }
}
