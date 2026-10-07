import copy from "@/content/console/pay";
import { guard } from "@/lib/api";
import { json, readJson, str } from "@/lib/http";
import { chargeAuthorization, initialize, newReference } from "@/lib/paystack";
import { recordFailure, settle } from "@/lib/payments";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";
const METHODS = ["card", "bank_transfer", "ussd", "saved_card"];

export async function POST(request) {
  const { ctx, res } = await guard(request, { business: true });
  if (res) return res;
  if (ctx.role !== "owner") return json({ ok: false, message: format(copy.ownerOnly, { business: ctx.business.name }) }, 403);
  const body = await readJson(request, 2 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const method = METHODS.includes(data.method) ? data.method : null;
  if (!method) return json({ ok: false, message: copy.failed }, 400);

  const admin = getAdmin();
  const { data: invoice } = await admin.from("invoices").select("*").eq("number", str(data.invoice)).eq("business_id", ctx.business.id).maybeSingle();
  if (!invoice) return json({ ok: false, error: "not_found" }, 404);
  if (invoice.status !== "due") return json({ ok: false, message: copy.notDue }, 409);
  const { count: checking } = await admin.from("payments").select("id", { count: "exact", head: true }).eq("invoice_id", invoice.id).eq("status", "review");
  if (checking) return json({ ok: false, message: copy.checking }, 409);

  let card = null;
  if (method === "saved_card") {
    const { data: c } = await admin.from("saved_cards").select("id, card_authorizations(authorization_code, customer_email)").eq("id", str(data.card)).eq("business_id", ctx.business.id).maybeSingle();
    card = c && c.card_authorizations ? c.card_authorizations : null;
    if (!card) return json({ ok: false, message: copy.failed }, 404);
  }

  const reference = newReference();
  const { error } = await admin.from("payments").insert({
    reference,
    invoice_id: invoice.id,
    business_id: ctx.business.id,
    user_id: ctx.user.id,
    method,
    amount_kobo: invoice.total_kobo,
  });
  if (error) {
    console.error("[pay] start:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
  const metadata = { invoice: invoice.number, business: ctx.business.id, custom_fields: [{ display_name: "Invoice", variable_name: "invoice", value: invoice.number }] };

  if (method === "saved_card") {
    const charge = await chargeAuthorization({ authorizationCode: card.authorization_code, email: card.customer_email, amount: invoice.total_kobo, reference, metadata });
    if (!charge.ok || !charge.data) {
      await recordFailure(reference, { gateway_response: charge.message });
      return json({ ok: true, status: "failed" });
    }
    if (charge.data.status === "failed") {
      await recordFailure(reference, charge.data);
      return json({ ok: true, status: "failed" });
    }
    const s = await settle(reference);
    return json({ ok: true, status: s.status, receipt: s.receipt ? s.receipt.number : null, reference });
  }

  const init = await initialize({ email: ctx.email, amount: invoice.total_kobo, reference, channels: [method], metadata });
  if (!init.ok || !init.data || !init.data.access_code) {
    console.error("[pay] initialize:", init.message);
    await admin.from("payments").update({ status: "failed", failure_reason: "could_not_start" }).eq("reference", reference).eq("status", "pending");
    return json({ ok: false, message: copy.failed }, 502);
  }
  return json({ ok: true, accessCode: init.data.access_code, reference });
}
