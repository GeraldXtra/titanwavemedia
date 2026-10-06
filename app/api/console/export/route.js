import { allRows } from "@/lib/assist/console";
import { guard } from "@/lib/api";
import { lagosToday } from "@/lib/format";
import { likeExact } from "@/lib/text";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";


// Wave Assist: its setup (without our own ids), and every conversation with its messages and the
// details customers left. Test chats are never kept, so they are not in it. Null for a business
// that has never opened Wave Assist.
async function waveAssist(admin, biz) {
  if (!biz) return null;
  const { data: setup } = await admin
    .from("assistants")
    .select("created_at, updated_at, public_id, is_on, name, sells, prices, hours, areas, whatsapp, phone, email, qa, extra, greeting, starters, color, text_color, corner, sites, monthly_limit, seen_at, seen_site")
    .eq("business_id", biz)
    .maybeSingle();
  if (!setup) return null;
  const [conversations, messages, handovers] = await Promise.all([
    allRows(() => admin.from("assist_conversations").select("id, created_at, last_message_at, message_count, outcome, first_message, over_limit, ended_at, whatsapp_at").eq("business_id", biz).order("created_at"), 100000),
    allRows(() => admin.from("assist_messages").select("conversation_id, created_at, role, body, answered, handover, source").eq("business_id", biz).order("id"), 1000000),
    allRows(() => admin.from("assist_handovers").select("conversation_id, created_at, name, phone, email, question, handled_at").eq("business_id", biz).order("created_at"), 100000),
  ]);
  const byConversation = (list) => {
    const map = new Map();
    for (const { conversation_id: id, ...row } of list) {
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(row);
    }
    return map;
  };
  const said = byConversation(messages);
  const left = byConversation(handovers);
  return {
    setup,
    conversations: conversations.map(({ id, ...c }) => ({ ...c, messages: said.get(id) || [], handovers: left.get(id) || [] })),
  };
}

// Your data: everything we hold about you and your business, as one JSON file. Paystack's
// authorization codes for saved cards are never in it.
export async function GET(request) {
  const { ctx, res } = await guard(request, { write: false });
  if (res) return res;
  const admin = getAdmin();
  const uid = ctx.user.id;
  const biz = ctx.business ? ctx.business.id : null;
  const rows = async (q) => {
    const { data } = await q;
    return data || [];
  };
  const byBiz = (table, cols = "*") => (biz ? rows(admin.from(table).select(cols).eq("business_id", biz)) : Promise.resolve([]));

  const [profile, business, members, projects, quotes, updates, files, threads, invoices, payments, receipts, refunds, cards, activity, notifications, signins, interest, websiteMessages] = await Promise.all([
    rows(admin.from("profiles").select("email, full_name, notify_projects, notify_billing, notify_news, created_at").eq("user_id", uid)),
    biz ? rows(admin.from("businesses").select("name, phone, address, autopay, created_at").eq("id", biz)) : [],
    byBiz("business_members", "email, role, created_at, joined_at"),
    byBiz("projects", "id, title, summary, works_on, step, next_note, setup_kobo, care_kobo, live_at, care_started_on, created_at"),
    byBiz("quotes", "project_id, setup_kobo, care_kobo, summary, status, created_at, decided_at"),
    byBiz("project_updates", "project_id, kind, body, data, created_at"),
    byBiz("project_files", "project_id, name, size_bytes, mime, from_team, created_at"),
    byBiz("threads", "id, kind, status, subject, details, created_at"),
    byBiz("invoices", "id, number, title, kind, billed_name, billed_business, billed_email, billed_address, issued_at, due_on, status, total_kobo, note, period_start, period_end, paid_at"),
    byBiz("payments", "reference, invoice_id, method, channel, status, amount_kobo, fees_kobo, refunded_kobo, card_type, card_last4, card_bank, paid_at, created_at"),
    byBiz("receipts", "number, invoice_id, amount_kobo, paid_at, status, refunded_at"),
    byBiz("refund_requests", "receipt_id, reason, details, amount_kobo, status, created_at, decided_at, refunded_at"),
    ctx.role === "owner" ? byBiz("saved_cards", "card_type, last4, exp_month, exp_year, bank, is_default, created_at") : [],
    byBiz("activity", "kind, data, created_at"),
    rows(admin.from("notifications").select("audience, kind, data, created_at, read_at").eq("user_id", uid)),
    rows(admin.from("signin_events").select("created_at, method, browser, device").eq("user_id", uid)),
    rows(admin.from("product_interest").select("product, created_at").eq("user_id", uid)),
    rows(admin.from("messages").select("created_at, name, email, need, channel, rows, product, message").ilike("email", likeExact(ctx.email))),
  ]);

  const assist = await waveAssist(admin, biz);

  const threadIds = threads.map((t) => t.id);
  const invoiceIds = invoices.map((i) => i.id);
  const [messages, lines] = await Promise.all([
    threadIds.length ? rows(admin.from("thread_messages").select("thread_id, from_team, author_name, body, created_at").in("thread_id", threadIds).order("created_at")) : [],
    invoiceIds.length ? rows(admin.from("invoice_lines").select("invoice_id, position, description, quantity, unit_kobo, amount_kobo").in("invoice_id", invoiceIds)) : [],
  ]);

  const file = {
    about: "Everything Titan Wave Media holds about you and your business. Money is in kobo (100 kobo to the naira). Times are in UTC.",
    exported_at: new Date().toISOString(),
    you: profile[0] || null,
    business: business[0] || null,
    team: members,
    projects,
    quotes,
    project_updates: updates,
    project_files: files,
    conversations: threads.map((t) => ({ ...t, messages: messages.filter((m) => m.thread_id === t.id) })),
    invoices: invoices.map((i) => ({ ...i, lines: lines.filter((l) => l.invoice_id === i.id) })),
    payments,
    receipts,
    refund_requests: refunds,
    saved_cards: cards,
    activity,
    notifications,
    sign_ins: signins,
    product_interest: interest,
    website_messages: websiteMessages,
    wave_assist: assist,
  };
  return new Response(JSON.stringify(file, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="titan-wave-media-data-${lagosToday()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
