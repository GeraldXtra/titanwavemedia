import { guard } from "@/lib/api";
import { lagosToday } from "@/lib/format";
import { likeExact } from "@/lib/text";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";


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
  };
  return new Response(JSON.stringify(file, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="titan-wave-media-data-${lagosToday()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
