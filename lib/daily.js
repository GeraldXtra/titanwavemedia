import "server-only";
import { getAdmin } from "./supabase";
import { issueInvoice } from "./billing";
import { notifyTeam } from "./events";
import { lagosDay, lagosToday } from "./format";
import { chargeAuthorization, newReference } from "./paystack";
import { recordFailure, settle } from "./payments";
import { remind } from "./reminders";
import { format } from "./text";
import billing from "@/content/console/billing";

// The daily job, at 8 am Lagos time. Each step is safe to run twice on the same day: Care
// invoices are made once per month, a card is tried once a day, and each reminder goes once.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// "2026-11-01" plus one month: "2026-12-01". And the last day of that month.
function nextMonth(iso) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
}
function monthEnd(iso) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

// 1. Care invoices: a week before each month starts, the invoice for that month, due on its 1st.
export async function careInvoices(today) {
  const admin = getAdmin();
  const soon = lagosToday(7, new Date(`${today}T12:00:00Z`));
  const { data: projects } = await admin.from("projects").select("*").gt("care_kobo", 0).not("care_next_on", "is", null).is("care_ended_on", null).lte("care_next_on", soon);
  let made = 0;
  for (const p of projects || []) {
    let start = p.care_next_on;
    while (start <= soon) {
      const end = monthEnd(start);
      const [y, m] = start.split("-").map(Number);
      const month = `${MONTHS[m - 1]} ${y}`;
      const { isNew } = await issueInvoice({
        businessId: p.business_id,
        projectId: p.id,
        kind: "care",
        title: format(billing.titles.care, { project: p.title, month }),
        dueOn: start,
        lines: [{ description: format(billing.lines.care, { project: p.title, from: lagosDay(start), to: lagosDay(end) }), quantity: 1, unit_kobo: Number(p.care_kobo) }],
        periodStart: start,
        periodEnd: end,
      });
      if (isNew) made++;
      start = nextMonth(start);
      await admin.from("projects").update({ care_next_on: start }).eq("id", p.id);
    }
  }
  return made;
}

// Businesses whose Care is paid automatically: autopay on, with a default card.
async function autopayCards() {
  const admin = getAdmin();
  const { data } = await admin.from("businesses").select("id, saved_cards!inner(id, is_default, card_authorizations(authorization_code, customer_email))").eq("autopay", true).eq("saved_cards.is_default", true);
  const map = new Map();
  for (const b of data || []) {
    const card = b.saved_cards && b.saved_cards[0];
    if (card && card.card_authorizations) map.set(b.id, card.card_authorizations);
  }
  return map;
}

// 2. Automatic payments: Care invoices due today or earlier, once a day each.
export async function takeAutopay(today) {
  const admin = getAdmin();
  const cards = await autopayCards();
  if (!cards.size) return { tried: 0, paid: 0 };
  const { data: invoices } = await admin.from("invoices").select("*").eq("kind", "care").eq("status", "due").lte("due_on", today).in("business_id", [...cards.keys()]);
  let tried = 0;
  let paid = 0;
  for (const inv of invoices || []) {
    if (inv.autopay_tried_on && inv.autopay_tried_on >= today) continue;
    const { data: took } = await admin.from("invoices").update({ autopay_tried_on: today }).eq("id", inv.id).or(`autopay_tried_on.is.null,autopay_tried_on.lt.${today}`).select("id").maybeSingle();
    if (!took) continue;
    const card = cards.get(inv.business_id);
    const reference = newReference();
    await admin.from("payments").insert({ reference, invoice_id: inv.id, business_id: inv.business_id, method: "saved_card", source: "autopay", amount_kobo: inv.total_kobo });
    tried++;
    const charge = await chargeAuthorization({ authorizationCode: card.authorization_code, email: card.customer_email, amount: inv.total_kobo, reference, metadata: { invoice: inv.number, autopay: true } });
    if (!charge.ok || !charge.data || charge.data.status === "failed") {
      await recordFailure(reference, charge.data || { gateway_response: charge.message });
      await notifyTeam("autopay_failed", { number: inv.number }, `/console/invoices/${inv.number}`);
      continue;
    }
    const s = await settle(reference);
    if (s.status === "success") paid++;
  }
  return { tried, paid };
}

// 3. Reminders: 3 days before the due date, on the day and 3 days after. Invoices that will be
// paid automatically get no reminder before or on the day.
export async function reminders(today) {
  const admin = getAdmin();
  const at = (n) => lagosToday(n, new Date(`${today}T12:00:00Z`));
  const cards = await autopayCards();
  const steps = [
    { due: at(3), flag: "reminded_before_at", skipAuto: true },
    { due: today, flag: "reminded_due_at", skipAuto: true },
    { due: at(-3), flag: "reminded_after_at", skipAuto: false },
  ];
  let sent = 0;
  for (const s of steps) {
    const { data: invoices } = await admin.from("invoices").select("*").eq("status", "due").eq("due_on", s.due).is(s.flag, null).not("business_id", "is", null);
    for (const inv of invoices || []) {
      const { data: took } = await admin.from("invoices").update({ [s.flag]: new Date().toISOString() }).eq("id", inv.id).is(s.flag, null).select("id").maybeSingle();
      if (!took) continue;
      if (s.skipAuto && inv.kind === "care" && cards.has(inv.business_id)) continue;
      await remind(inv);
      sent++;
    }
  }
  return sent;
}

// 4. Payments still waiting (a missed webhook, a transfer that arrived late): ask Paystack.
export async function settleWaiting() {
  const admin = getAdmin();
  const { data } = await admin
    .from("payments")
    .select("reference")
    .eq("status", "pending")
    .lt("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
    .gt("created_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
    .limit(20);
  for (const p of data || []) await settle(p.reference);
  return (data || []).length;
}

// 5. Deleting what we no longer keep: contact messages after 12 months, assistant conversations
// after 6 months, and old sign in links and limit counts.
export async function deleteOld(now = new Date()) {
  const admin = getAdmin();
  const ago = (months) => {
    const d = new Date(now);
    d.setUTCMonth(d.getUTCMonth() - months);
    return d.toISOString();
  };
  const twoDays = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const count = async (q) => {
    const { data, error } = await q.select("id");
    if (error) console.error("[daily] delete:", error.message);
    return data ? data.length : 0;
  };
  return {
    messages: await count(admin.from("messages").delete().lt("created_at", ago(12))),
    chats: await count(admin.from("chat_logs").delete().lt("created_at", ago(6))),
    links: await count(admin.from("auth_links").delete().lt("created_at", twoDays)),
    limits: await count(admin.from("rate_hits").delete().lt("created_at", twoDays)),
  };
}

export async function runDaily({ check = false } = {}) {
  const admin = getAdmin();
  const today = lagosToday();
  const { data: run } = await admin.from("cron_runs").insert({ job: "daily", summary: { today, check } }).select("id").single();
  const summary = { today, check };
  let ok = true;
  for (const [name, step] of [
    ["care", () => careInvoices(today)],
    ["autopay", () => takeAutopay(today)],
    ["reminders", () => reminders(today)],
    ["settled", () => settleWaiting()],
    ["deleted", () => deleteOld()],
  ]) {
    try {
      summary[name] = await step();
    } catch (e) {
      ok = false;
      summary[name] = `failed: ${e.message}`;
      console.error(`[daily] ${name}:`, e.message);
    }
  }
  if (run) await admin.from("cron_runs").update({ finished_at: new Date().toISOString(), ok, summary }).eq("id", run.id);
  return { ok, summary };
}

