import copy from "@/content/console/team-inbox";
import { guard } from "@/lib/api";
import { logAction } from "@/lib/audit";
import { addActivity, notifyBusiness } from "@/lib/events";
import { json, readJson } from "@/lib/http";
import { finishRefund } from "@/lib/payments";
import { refund as paystackRefund } from "@/lib/paystack";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { team: true });
  if (res) return res;
  const admin = getAdmin();
  const { data: thread } = await admin.from("threads").select("*").eq("id", id).maybeSingle();
  if (!thread) return json({ ok: false, error: "not_found" }, 404);
  const body = await readJson(request, 1024);
  const action = body.data && body.data.action;

  if (action === "solve" && thread.kind === "help") {
    await admin.from("threads").update({ status: "solved", updated_at: new Date().toISOString() }).eq("id", thread.id);
    return json({ ok: true, message: copy.solved });
  }

  if ((action === "approve" || action === "decline") && thread.kind === "refund" && thread.refund_id) {
    const { data: rr } = await admin.from("refund_requests").select("*, payments(reference), receipts(number)").eq("id", thread.refund_id).single();
    if (rr.status !== "requested") return json({ ok: false, error: "not_waiting" }, 409);
    const now = new Date().toISOString();
    const number = rr.receipts.number;

    if (action === "decline") {
      await admin.from("refund_requests").update({ status: "declined", decided_at: now, decided_by: ctx.user.id }).eq("id", rr.id).eq("status", "requested");
      await admin.from("receipts").update({ status: "paid" }).eq("id", rr.receipt_id).eq("status", "refund_requested");
      await admin.from("threads").update({ status: "replied", updated_at: now }).eq("id", thread.id);
      await addActivity(rr.business_id, null, "refund_declined", { number });
      await notifyBusiness(rr.business_id, "refund_declined", { number }, `/console/receipts/${number}`);
      await logAction(ctx, "refund_declined", number);
      return json({ ok: true, message: copy.refund.declined });
    }

    const { data: took } = await admin.from("refund_requests").update({ status: "processing", decided_at: now, decided_by: ctx.user.id }).eq("id", rr.id).eq("status", "requested").select("id").maybeSingle();
    if (!took) return json({ ok: false, error: "not_waiting" }, 409);
    const r = await paystackRefund({ reference: rr.payments.reference, amount: rr.amount_kobo, note: `Refund for ${number}` });
    if (!r.ok) {
      await admin.from("refund_requests").update({ status: "requested", decided_at: null, decided_by: null }).eq("id", rr.id);
      return json({ ok: false, message: format(copy.refund.failed, { message: r.message }) }, 502);
    }
    if (r.data && r.data.id) await admin.from("refund_requests").update({ paystack_refund_id: Number(r.data.id) }).eq("id", rr.id);
    await admin.from("threads").update({ status: "replied", updated_at: now }).eq("id", thread.id);
    await logAction(ctx, "refund_approved", number, { amount_kobo: rr.amount_kobo });
    if (r.data && r.data.status === "processed") await finishRefund(rr.id, { paystackRefundId: Number(r.data.id), amount: Number(r.data.amount) });
    return json({ ok: true, message: copy.refund.approved });
  }

  return json({ ok: false, error: "bad_action" }, 400);
}
