import copy from "@/content/console/billing";
import pay from "@/content/console/pay";
import { guard } from "@/lib/api";
import { addActivity } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { methodLabel, saveCard } from "@/lib/payments";
import { verify } from "@/lib/paystack";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";

const label = (c) => methodLabel({ channel: "card", card_type: c.card_type, card_last4: c.last4 });

export async function POST(request) {
  const { ctx, res } = await guard(request, { owner: true });
  if (res) return res;
  const body = await readJson(request, 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const admin = getAdmin();
  const biz = ctx.business.id;

  if (data.action === "save") {
    const { data: payment } = await admin.from("payments").select("reference, status, channel, paid_at").eq("reference", str(data.reference)).eq("business_id", biz).maybeSingle();
    const fresh = payment && payment.paid_at && Date.now() - new Date(payment.paid_at).getTime() < 60 * 60 * 1000;
    if (!payment || payment.status !== "success" || payment.channel !== "card" || !fresh) return json({ ok: false, message: pay.failed }, 400);
    const v = await verify(payment.reference);
    if (!v.ok || !v.data || v.data.status !== "success") return json({ ok: false, message: pay.failed }, 502);
    const card = await saveCard({ tx: v.data, businessId: biz, userId: ctx.user.id });
    if (!card) return json({ ok: false, message: pay.failed }, 400);
    return json({ ok: true, message: format(pay.save.saved, { card: label(card) }) });
  }

  const { data: card } = await admin.from("saved_cards").select("*").eq("id", str(data.id)).eq("business_id", biz).maybeSingle();
  if (!card) return json({ ok: false, error: "not_found" }, 404);

  if (data.action === "default") {
    await admin.from("saved_cards").update({ is_default: false }).eq("business_id", biz).eq("is_default", true);
    await admin.from("saved_cards").update({ is_default: true }).eq("id", card.id);
    return json({ ok: true, message: format(copy.methods.defaultSet, { card: label(card) }) });
  }

  if (data.action === "remove") {
    await admin.from("saved_cards").delete().eq("id", card.id);
    const { data: left } = await admin.from("saved_cards").select("id").eq("business_id", biz).order("created_at").limit(1);
    if (left && left.length && card.is_default) await admin.from("saved_cards").update({ is_default: true }).eq("id", left[0].id);
    if (!left || !left.length) await admin.from("businesses").update({ autopay: false }).eq("id", biz);
    await addActivity(biz, ctx.user.id, "card_removed", { card: label(card) });
    return json({ ok: true, message: format(copy.methods.removed, { card: label(card) }) });
  }
  return json({ ok: false, error: "bad_action" }, 400);
}
