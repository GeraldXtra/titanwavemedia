import "server-only";
import { getAdmin } from "./supabase";
import { addActivity, businessPeople, notifyBusiness, notifyTeam } from "./events";
import { lagosDay, naira } from "./format";
import { sendEmail } from "./mail";
import { txFacts, verify } from "./paystack";
import { siteUrl } from "./seo";
import { format } from "./text";
import billing from "@/content/console/billing";

// What happens around a payment: recording what Paystack confirmed, the receipt, the bell and
// the emails. Used by the verify step, the webhook, saved card payments and the daily job, in
// any order: the database function makes the second call a no op, and only the first one tells
// anybody.

// "Visa ending 4081", "Bank transfer", "USSD".
export function methodLabel(p) {
  const m = billing.method;
  if (p.channel === "card" || (!p.channel && (p.method === "card" || p.method === "saved_card"))) {
    const brand = String(p.card_type || "").trim().split(/\s+/)[0];
    if (p.card_last4) return format(m.card, { brand: brand ? brand[0].toUpperCase() + brand.slice(1).toLowerCase() : "Card", last4: p.card_last4 });
    return m.cardNoNumber;
  }
  return m[p.channel] || m[p.method] || m.other;
}

async function billingPeople(businessId) {
  if (!businessId) return [];
  return (await businessPeople(businessId, { ownersOnly: true })).filter((p) => p.profile.notify_billing !== false);
}

// Records a transaction Paystack says is successful. Returns { ok, receipt, invoice, payment }
// or { ok: false, error }.
export async function recordSuccess(tx) {
  const admin = getAdmin();
  const { data: result, error } = await admin.rpc("record_payment_success", txFacts(tx));
  if (error) throw new Error(`record payment: ${error.message}`);
  if (!result || !result.ok) {
    if (result && result.error === "amount_mismatch") {
      const { data: inv } = await admin.from("invoices").select("number").eq("id", result.invoice_id).maybeSingle();
      await notifyTeam("payment_review", { number: inv ? inv.number : "" }, "/console/team/payments");
    }
    return { ok: false, error: result ? result.error : "unknown" };
  }
  const [{ data: payment }, { data: invoice }, { data: receipt }] = await Promise.all([
    admin.from("payments").select("*").eq("id", result.payment_id).single(),
    admin.from("invoices").select("*").eq("id", result.invoice_id).single(),
    admin.from("receipts").select("*").eq("id", result.receipt_id).single(),
  ]);
  if (!result.already) await afterSuccess({ payment, invoice, receipt, double: result.double });
  return { ok: true, already: result.already, payment, invoice, receipt };
}

async function afterSuccess({ payment, invoice, receipt, double }) {
  const admin = getAdmin();
  const data = { number: invoice.number, amount_kobo: payment.amount_kobo };
  const biz = invoice.business_id;
  await addActivity(biz, payment.user_id, "payment_ok", data);
  await notifyBusiness(biz, "payment_ok", { number: invoice.number }, `/console/receipts/${receipt.number}`);
  const { data: b } = biz ? await admin.from("businesses").select("name").eq("id", biz).maybeSingle() : { data: null };
  await notifyTeam("payment_in", { business: b ? b.name : invoice.billed_business, amount_kobo: payment.amount_kobo }, `/console/team/payments`);
  if (double) await notifyTeam("double_payment", { number: invoice.number }, `/console/team/payments`);
  if (invoice.project_id) await admin.from("project_updates").insert({ project_id: invoice.project_id, business_id: biz, kind: "payment", data });
  for (const p of await billingPeople(biz)) {
    try {
      await sendEmail({
        to: p.email,
        key: "receipt",
        url: `${siteUrl}/console/receipts/${receipt.number}`,
        data: {
          first: (p.profile.full_name || "").split(/\s+/)[0] || undefined,
          amount: naira(payment.amount_kobo),
          title: invoice.title,
          number: receipt.number,
          date: lagosDay(payment.paid_at),
          method: methodLabel(payment),
          reference: payment.reference,
        },
      });
    } catch (e) {
      console.error("[payments] receipt email:", e.message);
    }
  }
}

// A payment that did not go through: marked failed (only while it was waiting), and the
// business is told, with an email to pay another way.
export async function recordFailure(reference, tx = {}) {
  const admin = getAdmin();
  const { data: payment } = await admin
    .from("payments")
    .update({ status: "failed", failure_reason: (tx.gateway_response || "failed").slice(0, 200), channel: tx.channel || null, verified_at: new Date().toISOString() })
    .eq("reference", reference)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (!payment) return null;
  const { data: invoice } = await admin.from("invoices").select("*").eq("id", payment.invoice_id).single();
  const auth = tx.authorization || {};
  const shown = { ...payment, card_type: auth.card_type || payment.card_type, card_last4: auth.last4 && /^\d{4}$/.test(auth.last4) ? auth.last4 : payment.card_last4 };
  await addActivity(invoice.business_id, payment.user_id, "payment_failed", { number: invoice.number });
  await notifyBusiness(invoice.business_id, "payment_failed", { number: invoice.number }, `/console/invoices/${invoice.number}`);
  for (const p of await billingPeople(invoice.business_id)) {
    try {
      await sendEmail({
        to: p.email,
        key: "failed",
        url: `${siteUrl}/console/invoices/${invoice.number}?pay=1`,
        data: { first: (p.profile.full_name || "").split(/\s+/)[0] || undefined, amount: naira(payment.amount_kobo), number: invoice.number, method: methodLabel(shown) },
      });
    } catch (e) {
      console.error("[payments] failed email:", e.message);
    }
  }
  return payment;
}

// Asks Paystack about a payment and records what it says. Returns "success", "failed" or
// "pending" (a transfer still on its way, or a window closed early).
export async function settle(reference) {
  const v = await verify(reference);
  if (!v.ok || !v.data) return { status: "pending" };
  const tx = v.data;
  if (tx.status === "success") {
    const r = await recordSuccess(tx);
    return r.ok ? { status: "success", ...r, tx } : { status: "review" };
  }
  if (tx.status === "failed") {
    await recordFailure(reference, tx);
    return { status: "failed", tx };
  }
  if (tx.status === "abandoned") {
    await getAdmin().from("payments").update({ status: "abandoned" }).eq("reference", reference).eq("status", "pending");
  }
  return { status: "pending", tx };
}

// Payments for an invoice still waiting on Paystack (a transfer that arrives a few minutes after
// the window closed): asks Paystack about each, so the invoice page shows Paid once it is.
// Returns true when one of them went through.
export async function settleWaitingFor(invoiceId) {
  const { data } = await getAdmin()
    .from("payments")
    .select("reference")
    .eq("invoice_id", invoiceId)
    .in("status", ["pending", "abandoned"])
    .gt("created_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(3);
  let paid = false;
  for (const p of data || []) if ((await settle(p.reference)).status === "success") paid = true;
  return paid;
}

// Saves the card from a successful card payment: what Paystack returns, never the card number.
// The authorization code goes in a table only the server can read. Returns the card row.
export async function saveCard({ tx, businessId, userId }) {
  const auth = tx.authorization || {};
  if (tx.channel !== "card" || !auth.reusable || !auth.authorization_code) return null;
  const admin = getAdmin();
  if (auth.signature) {
    const { data: known } = await admin.from("saved_cards").select("*").eq("business_id", businessId).eq("signature", auth.signature).maybeSingle();
    if (known) {
      await admin.from("card_authorizations").upsert({ card_id: known.id, authorization_code: auth.authorization_code, customer_email: (tx.customer && tx.customer.email) || "" });
      return known;
    }
  }
  const { count } = await admin.from("saved_cards").select("id", { count: "exact", head: true }).eq("business_id", businessId);
  const { data: card, error } = await admin
    .from("saved_cards")
    .insert({
      business_id: businessId,
      card_type: String(auth.card_type || auth.brand || "").trim() || null,
      last4: auth.last4,
      exp_month: auth.exp_month || null,
      exp_year: auth.exp_year || null,
      bank: auth.bank || null,
      signature: auth.signature || null,
      is_default: !count,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw new Error(`save card: ${error.message}`);
  await admin.from("card_authorizations").insert({ card_id: card.id, authorization_code: auth.authorization_code, customer_email: (tx.customer && tx.customer.email) || "" });
  await addActivity(businessId, userId, "card_saved", { card: methodLabel({ channel: "card", card_type: card.card_type, card_last4: card.last4 }) });
  return card;
}

// A refund Paystack has finished: the receipt shows Refunded, and the client gets an email.
export async function finishRefund(refundId, { paystackRefundId = null, amount = null, at = null } = {}) {
  const admin = getAdmin();
  const { data: result, error } = await admin.rpc("record_refund_done", {
    p_refund_id: refundId,
    p_paystack_refund_id: paystackRefundId,
    p_refunded_kobo: amount,
    p_refunded_at: at,
  });
  if (error) throw new Error(`refund: ${error.message}`);
  if (!result.ok || result.already) return result;
  const { data: rr } = await admin.from("refund_requests").select("*, receipts(number), payments(reference, invoice_id)").eq("id", refundId).single();
  const { data: invoice } = await admin.from("invoices").select("number, title").eq("id", rr.payments.invoice_id).single();
  const data = { number: rr.receipts.number, amount_kobo: rr.refunded_kobo || rr.amount_kobo };
  await addActivity(rr.business_id, null, "refund_done", data);
  await notifyBusiness(rr.business_id, "refund_done", data, `/console/receipts/${rr.receipts.number}`);
  const people = rr.business_id ? await businessPeople(rr.business_id, { ownersOnly: true }) : [];
  for (const p of people) {
    try {
      await sendEmail({
        to: p.email,
        key: "refund_sent",
        url: `${siteUrl}/console/receipts/${rr.receipts.number}`,
        data: { first: (p.profile.full_name || "").split(/\s+/)[0] || undefined, amount: naira(data.amount_kobo), title: invoice.title, number: rr.receipts.number, reference: rr.payments.reference },
      });
    } catch (e) {
      console.error("[payments] refund email:", e.message);
    }
  }
  return result;
}
