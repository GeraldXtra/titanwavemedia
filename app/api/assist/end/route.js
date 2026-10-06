import { chatRequest, uuidOrNull } from "@/lib/assist/request";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Start again: { token, conversationId } ends the conversation, so the next message opens a new
// one. A test chat keeps nothing, so there is nothing to end.
export async function POST(request) {
  const { data, token, res } = await chatRequest(request, 2 * 1024);
  if (res) return res;
  const id = uuidOrNull(data.conversationId);
  if (token.t === 1 || !id) return json({ ok: true });
  const { error } = await getAdmin()
    .from("assist_conversations")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", id)
    .eq("assistant_id", token.a)
    .is("ended_at", null);
  if (error) {
    console.error("[assist] end:", error.message);
    return json({ ok: false, error: "failed" }, 500);
  }
  return json({ ok: true });
}
