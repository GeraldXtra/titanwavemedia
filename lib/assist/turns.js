import "server-only";
import { keyHash } from "../security";
import { getAdmin } from "../supabase";
import { questionKey } from "./privacy";

export const ASSIST_LIMITS = {
  visitor: 30,
  conversation: 30,
  starts: 3,
  test: 50,
  handover: 5,
};

export function dailyLimit() {
  const n = Number(process.env.ASSIST_DAILY_LIMIT);
  return process.env.ASSIST_DAILY_LIMIT && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1000;
}

export const visitorKey = (assistantId, ip) => keyHash(`assistVisitor:${assistantId}:${ip}`);
export const startsKey = (assistantId, ip) => keyHash(`assistStarts:${assistantId}:${ip}`);
export const handoverKey = (assistantId, ip) => keyHash(`assistHandover:${assistantId}:${ip}`);

async function rpc(name, args) {
  const { data, error } = await getAdmin().rpc(name, args);
  if (error) throw new Error(`assist ${name}: ${error.message}`);
  return data;
}

export function beginTurn({ assistant, conversationId, ip, question, test, model }) {
  return rpc("assist_begin_turn", {
    p_assistant_id: assistant.id,
    p_conversation_id: conversationId || null,
    p_visitor_key: visitorKey(assistant.id, ip),
    p_starts_key: startsKey(assistant.id, ip),
    p_first: String(question || "").slice(0, 600),
    p_test: Boolean(test),
    p_model: Boolean(model),
    p_visitor_limit: ASSIST_LIMITS.visitor,
    p_conversation_limit: ASSIST_LIMITS.conversation,
    p_starts_limit: ASSIST_LIMITS.starts,
    p_day_limit: dailyLimit(),
    p_test_limit: ASSIST_LIMITS.test,
  });
}

export function finishTurn(assistantId, conversationId, question, reply) {
  return rpc("assist_finish_turn", {
    p_assistant_id: assistantId,
    p_conversation_id: conversationId,
    p_customer: question,
    p_question_key: questionKey(question),
    p_reply: reply.text,
    p_answered: reply.answered,
    p_handover: Boolean(reply.handover),
    p_source: reply.source,
    p_person: Boolean(reply.person),
  });
}

export function endConversation(assistantId, conversationId, ip) {
  return rpc("assist_end_conversation", {
    p_assistant_id: assistantId,
    p_conversation_id: conversationId || null,
    p_starts_key: startsKey(assistantId, ip),
    p_starts_limit: ASSIST_LIMITS.starts,
  });
}

export function takeHandover(assistantId, ip) {
  return rpc("rate_take", { p_bucket: "assistHandover", p_key: handoverKey(assistantId, ip), p_limit: ASSIST_LIMITS.handover, p_window_seconds: 3600 });
}
