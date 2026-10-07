import "server-only";
import { getAdmin } from "./supabase";
import { issueInvoice } from "./billing";
import { notifyTeam } from "./events";
import { lagosDay, lagosToday } from "./format";
import { addDays, nextBillingOn } from "./assist/plan";
import { chargeAuthorization, newReference } from "./paystack";
import { recordFailure, settle } from "./payments";
import { remind } from "./reminders";
import { format } from "./text";
import billing from "@/content/console/billing";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function nextMonth(iso) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
}
function monthEnd(iso) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

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

export async function assistInvoices(today) {
  const admin = getAdmin();
  const { data: list, error } = await admin
    .from("assistants")
    .select("id, business_id, plan_kobo, monthly_limit, billing_day, billing_next_on")
    .eq("billing_on", true)
    .not("plan_kobo", "is", null)
    .lte("billing_next_on", today);
  if (error) throw new Error(error.message);
  let made = 0;
  for (const a of list || []) {
    let start = a.billing_next_on;
    for (let round = 0; start <= today && round < 3; round++) {
      const next = nextBillingOn(start, a.billing_day);
      const end = addDays(next, -1);
      const words = { from: lagosDay(start), to: lagosDay(end), limit: Number(a.monthly_limit).toLocaleString("en-NG") };
      const { isNew } = await issueInvoice({
        businessId: a.business_id,
        kind: "assist",
        title: format(billing.titles.assist, words),
        dueOn: addDays(today, 7),
        lines: [{ description: format(billing.lines.assist, words), quantity: 1, unit_kobo: Number(a.plan_kobo) }],
        periodStart: start,
        periodEnd: end,
      });
      if (isNew) made++;
      const { data: moved } = await admin.from("assistants").update({ billing_next_on: next }).eq("id", a.id).eq("billing_next_on", start).select("id");
      if (!moved || !moved.length) break;
      start = next;
    }
  }
  return made;
}

export async function lateNotices(today) {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("invoices")
    .select("id, number, total_kobo, billed_business")
    .eq("kind", "assist")
    .eq("status", "due")
    .lte("due_on", addDays(today, -14))
    .is("late_noticed_at", null);
  if (error) throw new Error(error.message);
  let sent = 0;
  for (const inv of data || []) {
    const { data: took } = await admin.from("invoices").update({ late_noticed_at: new Date().toISOString() }).eq("id", inv.id).is("late_noticed_at", null).select("id").maybeSingle();
    if (!took) continue;
    await notifyTeam("assist_late", { number: inv.number, business: inv.billed_business, amount_kobo: inv.total_kobo }, `/console/invoices/${inv.number}`);
    sent++;
  }
  return sent;
}

const AUTOPAID = ["care", "assist"];

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

export async function takeAutopay(today) {
  const admin = getAdmin();
  const cards = await autopayCards();
  if (!cards.size) return { tried: 0, paid: 0 };
  const { data: invoices } = await admin.from("invoices").select("*").in("kind", AUTOPAID).eq("status", "due").lte("due_on", today).in("business_id", [...cards.keys()]);
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
      if (s.skipAuto && AUTOPAID.includes(inv.kind) && cards.has(inv.business_id)) continue;
      await remind(inv);
      sent++;
    }
  }
  return sent;
}

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
  const countDays = async (q) => {
    const { data, error } = await q.select("day");
    if (error) console.error("[daily] delete:", error.message);
    return data ? data.length : 0;
  };
  return {
    messages: await count(admin.from("messages").delete().lt("created_at", ago(12))),
    chats: await count(admin.from("chat_logs").delete().lt("created_at", ago(6))),
    links: await count(admin.from("auth_links").delete().lt("created_at", twoDays)),
    limits: await count(admin.from("rate_hits").delete().lt("created_at", twoDays)),
    assistCounts: await countDays(admin.from("assist_counters").delete().lt("day", twoDays.slice(0, 10))),
    assistConversations: await count(admin.from("assist_conversations").delete().lt("last_message_at", ago(6))),
    assistUsage: await count(admin.from("assist_usage").delete().lt("created_at", ago(13))),
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
    ["assist", () => assistInvoices(today)],
    ["autopay", () => takeAutopay(today)],
    ["reminders", () => reminders(today)],
    ["late", () => lateNotices(today)],
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

