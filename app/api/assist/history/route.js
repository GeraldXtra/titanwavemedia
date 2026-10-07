import { chatRequest, isOpen, loadConversation } from "@/lib/assist/request";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request) {
  const { data, token, res } = await chatRequest(request, 2 * 1024);
  if (res) return res;
  if (token.t === 1) return json({ ok: true, open: false, messages: [] });
  try {
    const conversation = await loadConversation(token.a, data.conversationId);
    if (!isOpen(conversation)) return json({ ok: true, open: false, messages: [] });
    const { data: rows, error } = await getAdmin()
      .from("assist_messages")
      .select("role, body, handover")
      .eq("conversation_id", conversation.id)
      .order("id", { ascending: true })
      .limit(80);
    if (error) throw new Error(error.message);
    return json({
      ok: true,
      open: true,
      handedOver: conversation.outcome === "handed_over",
      messages: (rows || []).map((m) => ({ role: m.role, text: m.body, handover: m.role === "assistant" && m.handover })),
    });
  } catch (error) {
    console.error("[assist] history:", error.message);
    return json({ ok: false, error: "failed" }, 500);
  }
}
