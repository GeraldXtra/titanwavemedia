import copy from "@/content/console/assist";
import { afterChange, assistAction, ensureAssistant } from "@/lib/assist/consoleApi";
import { MAX_PLAN_KOBO, MIN_PLAN_KOBO, addDays, dayOf } from "@/lib/assist/plan";
import { addActivity } from "@/lib/events";
import { lagosDay, lagosToday, naira, toKobo } from "@/lib/format";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";

const t = copy.team;
const n = (x) => Number(x).toLocaleString("en-NG");

function readLimit(value) {
  const limit = typeof value === "string" ? Number(value.replace(/[\s,]/g, "")) : value;
  return typeof limit === "number" && Number.isInteger(limit) && limit >= 0 && limit <= 1000000 ? limit : null;
}

async function firstBillingDay(admin, businessId, today) {
  const { data } = await admin
    .from("invoices")
    .select("period_end")
    .eq("business_id", businessId)
    .eq("kind", "assist")
    .not("period_end", "is", null)
    .order("period_end", { ascending: false })
    .limit(1);
  const last = data && data[0] && data[0].period_end;
  return last && last >= today ? addDays(last, 1) : today;
}

export async function POST(request) {
  const action = await assistAction(request, 2048);
  if (action.res) return action.res;
  const { ctx, data, team, business } = action;
  if (!team) return json({ ok: false, error: "forbidden" }, 403);
  const admin = getAdmin();

  try {
    const assistant = await ensureAssistant(business.id);
    if (!assistant) return json({ ok: false, error: "not_found" }, 404);
    const stamp = { updated_by: ctx.user.id, updated_at: new Date().toISOString() };

    if (typeof data.billing === "boolean") {
      if (data.billing && !assistant.plan_kobo) return json({ ok: false, error: "price", message: t.billingNoPrice }, 409);
      let patch = { billing_on: false };
      let next = null;
      if (data.billing) {
        const today = lagosToday();
        next = assistant.billing_on ? assistant.billing_next_on : await firstBillingDay(admin, business.id, today);
        patch = { billing_on: true, billing_day: dayOf(next), billing_next_on: next, billing_started_on: assistant.billing_on ? assistant.billing_started_on : today };
      }
      const { error } = await admin.from("assistants").update({ ...patch, ...stamp }).eq("id", assistant.id);
      if (error) throw new Error(error.message);
      const kind = data.billing ? "assist_billing_on" : "assist_billing_off";
      await addActivity(business.id, ctx.user.id, kind, {});
      await afterChange(action, assistant, kind);
      return json({ ok: true, billing: data.billing, message: data.billing ? format(t.billingTurnedOn, { date: lagosDay(next) }) : t.billingTurnedOff });
    }

    const limit = readLimit(data.limit);
    if (limit === null) return json({ ok: false, field: "limit", message: t.limitError }, 400);
    const raw = String(data.price ?? "").trim();
    const kobo = raw ? toKobo(raw) : null;
    if (raw && (kobo === null || kobo < MIN_PLAN_KOBO || kobo > MAX_PLAN_KOBO)) return json({ ok: false, field: "price", message: t.priceError }, 400);
    if (kobo === null && assistant.billing_on) return json({ ok: false, field: "price", message: t.priceNeeded }, 409);

    const { error } = await admin.from("assistants").update({ plan_kobo: kobo, monthly_limit: limit, ...stamp }).eq("id", assistant.id);
    if (error) throw new Error(error.message);
    if (kobo !== null) await addActivity(business.id, ctx.user.id, "assist_plan", { amount_kobo: kobo, limit: n(limit) });
    await afterChange(action, assistant, kobo === null ? "assist_plan_cleared" : "assist_plan", { price: kobo === null ? "" : naira(kobo), limit: n(limit) });
    return json({
      ok: true,
      price: kobo,
      limit,
      message: kobo === null ? format(t.planSavedNoPrice, { limit: n(limit) }) : format(t.planSaved, { price: naira(kobo), limit: n(limit) }),
    });
  } catch (error) {
    console.error("[assist console] plan:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
}
