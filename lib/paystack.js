import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Paystack, on the server only. Amounts are in kobo. The secret key never reaches the browser.
const API = "https://api.paystack.co";

async function call(path, { method = "GET", body } = {}) {
  try {
    const res = await fetch(API + path, {
      method,
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok && json.status === true, data: json.data, message: json.message || "", code: json.code, http: res.status };
  } catch (e) {
    return { ok: false, data: null, message: e.message, http: 0 };
  }
}

// Our own payment reference: letters, digits and dashes, which Paystack allows.
export function newReference() {
  return `TWM-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

// Starts a transaction for Paystack's own window (InlineJS). `channels` is one of
// ["card"], ["bank_transfer"] or ["ussd"], so the window offers that way only.
export function initialize({ email, amount, reference, channels, metadata }) {
  return call("/transaction/initialize", { method: "POST", body: { email, amount, currency: "NGN", reference, channels, metadata } });
}

export function verify(reference) {
  return call(`/transaction/verify/${encodeURIComponent(reference)}`);
}

// Charges a saved card. Only the email the card was first charged with works.
export function chargeAuthorization({ authorizationCode, email, amount, reference, metadata }) {
  return call("/transaction/charge_authorization", {
    method: "POST",
    body: { authorization_code: authorizationCode, email, amount, reference, currency: "NGN", metadata: JSON.stringify(metadata || {}) },
  });
}

export function refund({ reference, amount, note }) {
  return call("/refund", { method: "POST", body: { transaction: reference, amount, currency: "NGN", merchant_note: note } });
}

export function getRefund(id) {
  return call(`/refund/${encodeURIComponent(id)}`);
}

export function settlements({ perPage = 20 } = {}) {
  return call(`/settlement?perPage=${perPage}`);
}

export function balance() {
  return call("/balance");
}

// A webhook really came from Paystack: its signature is the HMAC SHA512 of the raw body.
export function signatureOk(raw, header) {
  if (!header || !process.env.PAYSTACK_SECRET_KEY) return false;
  const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(header));
  return a.length === b.length && timingSafeEqual(a, b);
}

// What a verified transaction tells us, ready for record_payment_success. The amount compared
// with the invoice is the one we asked for: Paystack can add its fees on top when they are passed
// to the customer.
export function txFacts(tx) {
  const auth = tx.authorization || {};
  return {
    p_reference: tx.reference,
    p_paystack_id: tx.id != null ? Number(tx.id) : null,
    p_amount_kobo: Number(tx.requested_amount != null ? tx.requested_amount : tx.amount),
    p_currency: tx.currency || "NGN",
    p_fees_kobo: tx.fees != null ? Number(tx.fees) : null,
    p_channel: tx.channel || null,
    p_paid_at: tx.paid_at || tx.paidAt || null,
    p_card_type: tx.channel === "card" ? String(auth.card_type || auth.brand || "").trim() : null,
    p_card_last4: tx.channel === "card" ? auth.last4 : null,
    p_card_bank: tx.channel === "card" ? auth.bank : null,
    p_card_exp_month: tx.channel === "card" ? auth.exp_month : null,
    p_card_exp_year: tx.channel === "card" ? auth.exp_year : null,
    p_gateway_response: tx.gateway_response || null,
  };
}
