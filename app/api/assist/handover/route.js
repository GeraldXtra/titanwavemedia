import { after } from "next/server";
import { checkDetails } from "@/lib/assist/details";
import { businessName } from "@/lib/assist/engine";
import { hideDetails } from "@/lib/assist/privacy";
import { chatRequest, loadConversation } from "@/lib/assist/request";
import { loadAssistant } from "@/lib/assist/store";
import { takeHandover } from "@/lib/assist/turns";
import { businessPeople, notifyBusiness } from "@/lib/events";
import { clientIp, json, str } from "@/lib/http";
import { sendEmail } from "@/lib/mail";
import { siteUrl } from "@/lib/seo";
import { getAdmin } from "@/lib/supabase";
import emails from "@/content/console/emails";

export const runtime = "nodejs";

async function lastQuestion(conversationId) {
  const { data } = await getAdmin()
    .from("assist_messages")
    .select("body, answered")
    .eq("conversation_id", conversationId)
    .eq("role", "customer")
    .order("id", { ascending: false })
    .limit(30);
  const rows = data || [];
  const missed = rows.find((m) => m.answered === false);
  return ((missed || rows[0] || {}).body || "").slice(0, 600) || null;
}

async function tellBusiness({ assistant, conversationId, name, phone, email, question }) {
  const link = conversationId ? `/console/assist/conversations/${conversationId}` : "/console/assist?tab=conversations";
  try {
    await notifyBusiness(assistant.business_id, "assist_handover", { name }, link);
  } catch (error) {
    console.error("[assist] handover notice:", error.message);
  }
  let people = [];
  try {
    people = await businessPeople(assistant.business_id);
  } catch (error) {
    console.error("[assist] handover people:", error.message);
  }
  const t = emails.templates.assist_handover;
  const data = { name, phone: phone || t.notGiven, email: email || t.notGiven, question: question || t.notGiven, business: businessName(assistant) };
  for (const p of people) {
    if (!p.email) continue;
    try {
      await sendEmail({ to: p.email, key: "assist_handover", data, url: `${siteUrl}${link}`, ...(email ? { replyTo: email } : {}) });
    } catch (error) {
      console.error(`[assist] handover email to a team member could not be sent: ${error.message}`);
    }
  }
}

export async function POST(request) {
  const { data, token, res } = await chatRequest(request, 4 * 1024);
  if (res) return res;
  const checked = checkDetails(data);
  if (!checked.ok) return json({ ok: false, error: "invalid", fields: checked.errors }, 400);
  if (token.t === 1) return json({ ok: true, test: true });
  const { name, phone, email } = checked.values;

  try {
    const assistant = await loadAssistant(token.p);
    if (!assistant || assistant.id !== token.a) return json({ ok: false, error: "token" }, 401);
    const conversation = await loadConversation(assistant.id, data.conversationId);

    const limit = await takeHandover(assistant.id, clientIp(request));
    if (!limit || !limit.ok) return json({ ok: false, error: "limit" }, 429, { "Retry-After": String((limit && limit.retry_after) || 3600) });

    const asked = hideDetails(str(data.question).replace(/\s+/g, " ").trim()).slice(0, 600) || null;
    const question = (conversation && (await lastQuestion(conversation.id))) || asked;
    const admin = getAdmin();
    const { error } = await admin.from("assist_handovers").insert({
      conversation_id: conversation ? conversation.id : null,
      business_id: assistant.business_id,
      name,
      phone: phone || null,
      email: email || null,
      question,
    });
    if (error) throw new Error(error.message);
    if (conversation) {
      const { error: outcome } = await admin.from("assist_conversations").update({ outcome: "handed_over" }).eq("id", conversation.id);
      if (outcome) console.error("[assist] handover outcome:", outcome.message);
    }

    after(() => tellBusiness({ assistant, conversationId: conversation ? conversation.id : null, name, phone, email, question }));
    return json({ ok: true });
  } catch (error) {
    console.error("[assist] handover:", error.message);
    return json({ ok: false, error: "failed" }, 500);
  }
}
