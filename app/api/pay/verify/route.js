import { guard } from "@/lib/api";
import { json, readJson, str } from "@/lib/http";
import { methodLabel, settle } from "@/lib/payments";
import { naira } from "@/lib/format";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// After Paystack's window: our server asks Paystack how the payment went, and only a payment
// Paystack confirms marks the invoice paid. Also says whether the card can be saved.
export async function POST(request) {
  const { ctx, res } = await guard(request, { business: true });
  if (res) return res;
  const body = await readJson(request, 1024);
  const reference = str(body.data && body.data.reference);
  const admin = getAdmin();
  const { data: payment } = await admin.from("payments").select("*").eq("reference", reference).eq("business_id", ctx.business.id).maybeSingle();
  if (!payment) return json({ ok: false, error: "not_found" }, 404);

  const s = await settle(reference);
  if (s.status !== "success") return json({ ok: true, status: s.status });

  const auth = (s.tx && s.tx.authorization) || {};
  let canSave = false;
  if (ctx.role === "owner" && s.tx.channel === "card" && auth.reusable) {
    const { data: known } = auth.signature ? await admin.from("saved_cards").select("id").eq("business_id", ctx.business.id).eq("signature", auth.signature).maybeSingle() : { data: null };
    canSave = !known;
  }
  return json({
    ok: true,
    status: "success",
    receipt: s.receipt.number,
    amount: naira(s.payment.amount_kobo),
    method: methodLabel(s.payment),
    canSave,
  });
}
