import copy from "@/content/console/assist";
import { afterChange, assistAction, isUuid } from "@/lib/assist/consoleApi";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { id } = await params;
  const action = await assistAction(request, 1024);
  if (action.res) return action.res;
  const { ctx, data, business } = action;
  if (data.handled !== true) return json({ ok: false, error: "invalid" }, 400);
  if (!isUuid(id)) return json({ ok: false, message: copy.notFound }, 404);

  const admin = getAdmin();
  const { data: handover, error } = await admin.from("assist_handovers").select("id, handled_at").eq("id", id).eq("business_id", business.id).maybeSingle();
  if (error) {
    console.error("[assist console] handover:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
  if (!handover) return json({ ok: false, message: copy.notFound }, 404);
  if (!handover.handled_at) {
    const { error: e } = await admin
      .from("assist_handovers")
      .update({ handled_at: new Date().toISOString(), handled_by: ctx.user.id })
      .eq("id", id)
      .eq("business_id", business.id)
      .is("handled_at", null);
    if (e) {
      console.error("[assist console] handover:", e.message);
      return json({ ok: false, message: copy.failed }, 502);
    }
    await afterChange(action, null, "assist_handled");
  }
  return json({ ok: true, message: copy.conversations.handledDone });
}
