import copy from "@/content/console/team-invoices";
import { guard } from "@/lib/api";
import { logAction } from "@/lib/audit";
import { issueInvoice } from "@/lib/billing";
import { lagosToday } from "@/lib/format";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
const DAYS = copy.form.dueOptions.map((o) => o.days);

export async function POST(request) {
  const { ctx, res } = await guard(request, { team: true });
  if (res) return res;
  const body = await readJson(request, 32 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const admin = getAdmin();
  const { data: biz } = await admin.from("businesses").select("id, name").eq("id", str(data.business)).maybeSingle();
  if (!biz) return json({ ok: false, message: copy.form.errors.client }, 400);
  let projectId = null;
  if (data.project) {
    const { data: p } = await admin.from("projects").select("id").eq("id", str(data.project)).eq("business_id", biz.id).maybeSingle();
    if (!p) return json({ ok: false, message: copy.form.errors.failed }, 400);
    projectId = p.id;
  }
  const lines = (Array.isArray(data.lines) ? data.lines : []).slice(0, 50).map((l) => ({
    description: str(l && l.description).trim().slice(0, 200),
    quantity: Number.parseInt(l && l.quantity, 10),
    unit_kobo: Number.parseInt(l && l.unit_kobo, 10),
  }));
  if (!lines.length || lines.some((l) => !l.description || !(l.quantity >= 1 && l.quantity <= 100000) || !(l.unit_kobo >= 1))) {
    return json({ ok: false, message: copy.form.errors.lines }, 400);
  }
  const days = DAYS.includes(Number(data.days)) ? Number(data.days) : 7;
  try {
    const { invoice } = await issueInvoice({
      businessId: biz.id,
      projectId,
      kind: "custom",
      title: lines[0].description,
      dueOn: lagosToday(days),
      note: str(data.note).trim().slice(0, 500) || null,
      lines,
      createdBy: ctx.user.id,
    });
    await logAction(ctx, "invoice_sent", invoice.number, { business: biz.name, amount_kobo: invoice.total_kobo });
    return json({ ok: true, number: invoice.number });
  } catch (e) {
    console.error("[team invoices]", e.message);
    return json({ ok: false, message: copy.form.errors.failed }, 502);
  }
}
