import { notifyTeam } from "@/lib/events";
import { json } from "@/lib/http";
import { finishRefund, settle } from "@/lib/payments";
import { signatureOk } from "@/lib/paystack";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Paystack's webhook. It must carry Paystack's signature (an HMAC of the raw body with our
// secret key). Repeats are ignored. Handled: successful charges, and refunds.
// We answer 200 once an event is handled, so Paystack stops sending it; on our own failure we
// answer 500, so Paystack tries again later.
export async function POST(request) {
  const raw = await request.text();
  if (!signatureOk(raw, request.headers.get("x-paystack-signature"))) return json({ ok: false }, 401);
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ ok: false }, 400);
  }
  const data = event.data || {};
  const name = String(event.event || "");
  const isRefund = name.startsWith("refund.");
  const reference = isRefund ? data.transaction_reference : data.reference;
  const key = isRefund ? `${name}:${reference}:${data.status || ""}` : `${name}:${data.id || reference}`;

  const admin = getAdmin();
  const { data: seen } = await admin.from("paystack_events").select("id").eq("dedupe_key", key).maybeSingle();
  if (seen) return json({ ok: true, repeat: true });

  let outcome = "ignored";
  try {
    const { data: payment } = reference ? await admin.from("payments").select("id, reference, invoice_id").eq("reference", String(reference)).maybeSingle() : { data: null };
    if (!payment) {
      outcome = "not_ours";
    } else if (name === "charge.success") {
      // The webhook says it worked; our server still asks Paystack, and takes the fees from there.
      const s = await settle(payment.reference);
      outcome = s.status;
    } else if (isRefund) {
      const { data: rr } = await admin.from("refund_requests").select("id, status").eq("payment_id", payment.id).in("status", ["requested", "processing", "refunded"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!rr) outcome = "no_refund";
      else if (name === "refund.processed") {
        await finishRefund(rr.id, { amount: data.amount != null ? Number(data.amount) : null });
        outcome = "refunded";
      } else if (name === "refund.failed") {
        await admin.rpc("record_refund_failed", { p_refund_id: rr.id, p_reason: "Paystack couldn't make the refund" });
        const { data: inv } = await admin.from("invoices").select("number").eq("id", payment.invoice_id).single();
        await notifyTeam("refund_failed", { number: inv.number }, "/console/team/payments");
        outcome = "refund_failed";
      } else {
        await admin.from("refund_requests").update({ status: "processing" }).eq("id", rr.id).eq("status", "requested");
        outcome = "refund_processing";
      }
    }
  } catch (e) {
    console.error("[webhook]", name, e.message);
    return json({ ok: false }, 500);
  }
  await admin.from("paystack_events").insert({ dedupe_key: key, event: name.slice(0, 60), reference: reference ? String(reference).slice(0, 120) : null, outcome, processed_at: new Date().toISOString() });
  return json({ ok: true });
}
