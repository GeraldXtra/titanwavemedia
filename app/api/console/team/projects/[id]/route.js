import copy from "@/content/console/team-project";
import { guard } from "@/lib/api";
import { logAction } from "@/lib/audit";
import { secondHalfInvoice } from "@/lib/billing";
import { stepName } from "@/lib/console";
import { addActivity, notifyBusiness } from "@/lib/events";
import { lagosParts, lagosToday, toKobo } from "@/lib/format";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";

// The first day of next month in Lagos, when Care invoices start.
function firstOfNextMonth() {
  const p = lagosParts();
  return new Date(Date.UTC(p.year, p.month, 1)).toISOString().slice(0, 10);
}

// Team actions on a project:
// - step: moves it to a step. Step 5 sends the second half invoice and starts Care.
// - note: what happens next, in our own words.
// - quote: sends a quote (the setup price, paid in two halves, and Care a month).
// - update: posts an update to the project's list.
export async function POST(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { team: true });
  if (res) return res;
  const admin = getAdmin();
  const { data: project } = await admin.from("projects").select("*, businesses(name)").eq("id", id).maybeSingle();
  if (!project) return json({ ok: false, error: "not_found" }, 404);
  const body = await readJson(request, 8 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const now = new Date().toISOString();
  const link = `/console/projects/${project.id}`;

  if (data.action === "step") {
    const n = Number(data.step);
    if (!Number.isInteger(n) || n < 1 || n > 5) return json({ ok: false }, 400);
    if (n === project.step) return json({ ok: false, message: copy.step.same }, 409);
    const patch = { step: n, updated_at: now };
    const goingLive = n === 5 && !project.live_at;
    if (goingLive) {
      patch.live_at = now;
      if (Number(project.care_kobo) > 0 && !project.care_started_on) {
        patch.care_started_on = lagosToday();
        patch.care_next_on = firstOfNextMonth();
      }
    }
    await admin.from("projects").update(patch).eq("id", project.id);
    await admin.from("project_updates").insert({ project_id: project.id, business_id: project.business_id, kind: "step", data: { step: n }, created_by: ctx.user.id });
    await addActivity(project.business_id, ctx.user.id, "step_changed", { project: project.title, step: n });
    await notifyBusiness(project.business_id, "step_changed", { project: project.title, step: n }, link);
    await logAction(ctx, "step_changed", project.title, { n, step: stepName(n), project: project.id });
    if (goingLive) {
      if (patch.care_started_on) await admin.from("project_updates").insert({ project_id: project.id, business_id: project.business_id, kind: "care", created_by: ctx.user.id });
      try {
        const second = await secondHalfInvoice({ ...project, ...patch }, ctx.user.id);
        if (second && second.isNew) await logAction(ctx, "invoice_sent", second.invoice.number, { business: project.businesses.name });
      } catch (e) {
        console.error("[team project] second half:", e.message);
      }
    }
    return json({ ok: true, message: format(copy.step.moved, { n, step: stepName(n) }) });
  }

  if (data.action === "note") {
    await admin.from("projects").update({ next_note: str(data.text).trim().slice(0, 1000) || null, updated_at: now }).eq("id", project.id);
    return json({ ok: true, message: copy.next.saved });
  }

  if (data.action === "quote") {
    const setup = toKobo(data.setup);
    const care = toKobo(data.care === "" || data.care == null ? "0" : data.care);
    if (!setup || setup < 2) return json({ ok: false, message: copy.quote.errors.setup }, 400);
    if (care === null) return json({ ok: false, message: copy.quote.errors.care }, 400);
    await admin.from("quotes").update({ status: "withdrawn" }).eq("project_id", project.id).eq("status", "sent");
    const { error } = await admin.from("quotes").insert({ project_id: project.id, business_id: project.business_id, setup_kobo: setup, care_kobo: care, summary: str(data.summary).trim().slice(0, 4000) || null, sent_by: ctx.user.id });
    if (error) {
      console.error("[team project] quote:", error.message);
      return json({ ok: false }, 502);
    }
    await admin.from("project_updates").insert({ project_id: project.id, business_id: project.business_id, kind: "quote", data: { amount_kobo: setup }, created_by: ctx.user.id });
    await addActivity(project.business_id, ctx.user.id, "quote_sent", { project: project.title });
    await notifyBusiness(project.business_id, "quote_sent", { project: project.title }, link);
    await logAction(ctx, "quote_sent", project.title, { setup_kobo: setup, care_kobo: care });
    return json({ ok: true, message: copy.quote.sent });
  }

  if (data.action === "update") {
    const text = str(data.text).trim().slice(0, 4000);
    if (!text) return json({ ok: false }, 400);
    await admin.from("project_updates").insert({ project_id: project.id, business_id: project.business_id, kind: "note", body: text, created_by: ctx.user.id });
    return json({ ok: true, message: copy.update.sent });
  }

  return json({ ok: false, error: "bad_action" }, 400);
}
