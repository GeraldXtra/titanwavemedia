import copy from "@/content/console/billing";
import { guard } from "@/lib/api";
import { addActivity } from "@/lib/events";
import { json, readJson } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Automatic payments for Care: on only when the owner switches it on, with a saved card.
export async function POST(request) {
  const { ctx, res } = await guard(request, { owner: true });
  if (res) return res;
  const body = await readJson(request, 1024);
  const on = body.data && body.data.on === true;
  const admin = getAdmin();
  if (on) {
    const { count } = await admin.from("saved_cards").select("id", { count: "exact", head: true }).eq("business_id", ctx.business.id);
    if (!count) return json({ ok: false, message: copy.methods.autoNeedsCard }, 409);
  }
  await admin.from("businesses").update({ autopay: on, updated_at: new Date().toISOString() }).eq("id", ctx.business.id);
  await addActivity(ctx.business.id, ctx.user.id, on ? "autopay_on" : "autopay_off", {});
  return json({ ok: true, message: on ? copy.methods.autoTurnedOn : copy.methods.autoTurnedOff });
}
