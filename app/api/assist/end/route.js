import { chatRequest, uuidOrNull } from "@/lib/assist/request";
import { endConversation } from "@/lib/assist/turns";
import { clientIp, json } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  const { data, token, res } = await chatRequest(request, 2 * 1024);
  if (res) return res;
  if (token.t === 1) return json({ ok: true, ended: false, kept: false });
  try {
    const r = await endConversation(token.a, uuidOrNull(data.conversationId), clientIp(request));
    return json({ ok: true, ended: Boolean(r && r.ended), kept: Boolean(r && r.kept) });
  } catch (error) {
    console.error("[assist] end:", error.message);
    return json({ ok: false, error: "failed" }, 500);
  }
}
