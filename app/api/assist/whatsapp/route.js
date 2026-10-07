import { chatRequest, uuidOrNull } from "@/lib/assist/request";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request) {
  const { data, token, res } = await chatRequest(request, 2 * 1024);
  if (res) return res;
  const id = uuidOrNull(data.conversationId);
  if (token.t === 1 || !id) return json({ ok: true });
  const { error } = await getAdmin()
    .from("assist_conversations")
    .update({ outcome: "handed_over", whatsapp_at: new Date().toISOString() })
    .eq("id", id)
    .eq("assistant_id", token.a);
  if (error) {
    console.error("[assist] whatsapp:", error.message);
    return json({ ok: false, error: "failed" }, 500);
  }
  return json({ ok: true });
}
