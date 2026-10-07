import copy from "@/content/console/project";
import { guard } from "@/lib/api";
import { firstHalfInvoice } from "@/lib/billing";
import { addActivity, notifyTeam } from "@/lib/events";
import { json, readJson } from "@/lib/http";
import { projectAccess } from "@/lib/projects";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { business: true });
  if (res) return res;
  const access = await projectAccess(ctx, id);
  if (!access || access.side !== "client") return json({ ok: false, error: "not_found" }, 404);
  const { project } = access;
  const body = await readJson(request, 1024);
  const action = body.data && body.data.action;
  const admin = getAdmin();
  const { data: quote } = await admin.from("quotes").select("*").eq("project_id", project.id).eq("status", "sent").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!quote) return json({ ok: false, error: "no_quote" }, 409);
  const now = new Date().toISOString();
  const link = `/console/team/projects/${project.id}`;

  if (action === "accept") {
    if (ctx.role !== "owner") return json({ ok: false, message: copy.quote.ownerOnly }, 403);
    const { data: took } = await admin.from("quotes").update({ status: "accepted", decided_at: now, decided_by: ctx.user.id }).eq("id", quote.id).eq("status", "sent").select("id").maybeSingle();
    if (!took) return json({ ok: false, error: "no_quote" }, 409);
    await admin.from("projects").update({ setup_kobo: quote.setup_kobo, care_kobo: quote.care_kobo, updated_at: now }).eq("id", project.id);
    await admin.from("project_updates").insert({ project_id: project.id, business_id: project.business_id, kind: "quote_accepted", created_by: ctx.user.id });
    await addActivity(project.business_id, ctx.user.id, "quote_accepted", { project: project.title });
    await notifyTeam("quote_accepted", { business: ctx.business.name, project: project.title }, link, { except: ctx.user.id });
    let invoice = null;
    try {
      ({ invoice } = await firstHalfInvoice({ ...project, setup_kobo: quote.setup_kobo }, quote.setup_kobo, ctx.user.id));
    } catch (e) {
      console.error("[quote] first invoice:", e.message);
    }
    return json({ ok: true, invoice: invoice ? invoice.number : null });
  }

  if (action === "changes") {
    await admin.from("quotes").update({ status: "changes", decided_at: now, decided_by: ctx.user.id }).eq("id", quote.id).eq("status", "sent");
    await admin.from("project_updates").insert({ project_id: project.id, business_id: project.business_id, kind: "quote_changes", created_by: ctx.user.id });
    await addActivity(project.business_id, ctx.user.id, "quote_changes", { project: project.title });
    await notifyTeam("quote_changes", { business: ctx.business.name, project: project.title }, link, { except: ctx.user.id });
    return json({ ok: true });
  }
  return json({ ok: false, error: "bad_action" }, 400);
}
