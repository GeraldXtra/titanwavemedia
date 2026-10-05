import copy from "@/content/console/invoice";
import { guard } from "@/lib/api";
import { logAction } from "@/lib/audit";
import { json, readJson, str } from "@/lib/http";
import { remind } from "@/lib/reminders";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";

// "Send a reminder" from Team view, for an unpaid invoice.
export async function POST(request) {
  const { ctx, res } = await guard(request, { team: true });
  if (res) return res;
  const body = await readJson(request, 1024);
  const { data: inv } = await getAdmin().from("invoices").select("*").eq("number", str(body.data && body.data.invoice)).maybeSingle();
  if (!inv || inv.status !== "due" || !inv.business_id) return json({ ok: false, error: "not_found" }, 404);
  const sent = await remind(inv);
  await logAction(ctx, "reminder_sent", inv.number, { people: sent });
  return json({ ok: true, message: sent === 1 ? copy.remindedOne : sent ? format(copy.reminded, { count: sent }) : copy.remindNobody });
}
