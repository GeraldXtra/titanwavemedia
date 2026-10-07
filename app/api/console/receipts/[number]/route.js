import copy from "@/content/console/receipt";
import { guard } from "@/lib/api";
import { addActivity, notifyBusiness, notifyTeam } from "@/lib/events";
import { lagosDay, naira } from "@/lib/format";
import { json, readJson, str } from "@/lib/http";
import { sendEmail } from "@/lib/mail";
import { methodLabel } from "@/lib/payments";
import { siteUrl } from "@/lib/seo";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { number } = await params;
  const { ctx, res } = await guard(request, { business: true });
  if (res) return res;
  const admin = getAdmin();
  const { data: receipt } = await admin.from("receipts").select("*").eq("number", number).eq("business_id", ctx.business.id).maybeSingle();
  if (!receipt) return json({ ok: false, error: "not_found" }, 404);
  const [{ data: payment }, { data: invoice }] = await Promise.all([
    admin.from("payments").select("*").eq("id", receipt.payment_id).single(),
    admin.from("invoices").select("*").eq("id", receipt.invoice_id).single(),
  ]);
  const body = await readJson(request, 4 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const first = (ctx.profile.full_name || "").split(/\s+/)[0] || undefined;

  if (data.action === "email") {
    await sendEmail({
      to: ctx.email,
      key: "receipt",
      url: `${siteUrl}/console/receipts/${receipt.number}`,
      data: { first, amount: naira(receipt.amount_kobo), title: invoice.title, number: receipt.number, date: lagosDay(receipt.paid_at), method: methodLabel(payment), reference: payment.reference },
    });
    return json({ ok: true, message: format(copy.emailed, { email: ctx.email }) });
  }

  if (data.action === "refund") {
    if (ctx.role !== "owner") return json({ ok: false, message: format(copy.refund.ownerOnly, { business: ctx.business.name }) }, 403);
    const reason = copy.refund.reasons.includes(data.reason) ? data.reason : copy.refund.reasons[copy.refund.reasons.length - 1];
    const details = str(data.details).trim().slice(0, 2000);
    if (receipt.status !== "paid") return json({ ok: false, message: copy.refund.already }, 409);
    const { data: rr, error } = await admin
      .from("refund_requests")
      .insert({ receipt_id: receipt.id, payment_id: payment.id, business_id: ctx.business.id, requested_by: ctx.user.id, reason, details: details || null, amount_kobo: receipt.amount_kobo - Number(payment.refunded_kobo || 0) })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return json({ ok: false, message: copy.refund.already }, 409);
      console.error("[refund] request:", error.message);
      return json({ ok: false, message: copy.refund.already }, 502);
    }
    await admin.from("receipts").update({ status: "refund_requested" }).eq("id", receipt.id).eq("status", "paid");
    const name = (ctx.profile.full_name || "").trim() || ctx.email;
    const now = new Date().toISOString();
    const { data: thread } = await admin
      .from("threads")
      .insert({ kind: "refund", status: "new", business_id: ctx.business.id, refund_id: rr.id, subject: receipt.number, from_name: name, from_email: ctx.email, details: { receipt: receipt.number, amount_kobo: receipt.amount_kobo, reason }, created_by: ctx.user.id, last_message_at: now, last_from: "client" })
      .select("id")
      .single();
    if (thread) await admin.from("thread_messages").insert({ thread_id: thread.id, from_team: false, author_id: ctx.user.id, author_name: name, body: details ? `${reason}.\n\n${details}` : `${reason}.` });
    await addActivity(ctx.business.id, ctx.user.id, "refund_requested", { number: receipt.number });
    await notifyBusiness(ctx.business.id, "refund_received", { number: receipt.number }, `/console/receipts/${receipt.number}`);
    await notifyTeam("new_refund", { business: ctx.business.name, amount_kobo: receipt.amount_kobo }, `/console/team/inbox?item=${thread ? thread.id : ""}`, { except: ctx.user.id });
    try {
      await sendEmail({ to: ctx.email, key: "refund_requested", url: `${siteUrl}/console/receipts/${receipt.number}`, data: { first, amount: naira(receipt.amount_kobo), title: invoice.title, number: receipt.number, reason } });
    } catch (e) {
      console.error("[refund] email:", e.message);
    }
    return json({ ok: true, message: copy.refund.sent });
  }
  return json({ ok: false, error: "bad_action" }, 400);
}
