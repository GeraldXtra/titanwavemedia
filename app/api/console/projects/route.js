import copy from "@/content/console/new-project";
import { guard } from "@/lib/api";
import { addActivity, notifyTeam } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request) {
  const { ctx, res } = await guard(request, { business: true });
  if (res) return res;
  const body = await readJson(request, 8 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const title = str(data.title).trim().slice(0, 160);
  const where = copy.whereOptions.includes(data.where) ? data.where : null;
  const more = str(data.more).trim().slice(0, 3500);
  if (!title) return json({ ok: false, message: copy.errors.what }, 400);

  const admin = getAdmin();
  const biz = ctx.business;
  const name = (ctx.profile.full_name || "").trim() || ctx.email;
  const { data: project, error } = await admin
    .from("projects")
    .insert({ business_id: biz.id, title, summary: more || null, works_on: where, step: 1, created_by: ctx.user.id })
    .select("id")
    .single();
  if (error) {
    console.error("[projects] new:", error.message);
    return json({ ok: false, message: copy.errors.failed }, 502);
  }
  const now = new Date().toISOString();
  const { data: thread } = await admin
    .from("threads")
    .insert({ kind: "project", status: "new", business_id: biz.id, project_id: project.id, subject: title, from_name: name, from_email: ctx.email, details: { where }, created_by: ctx.user.id, last_message_at: now, last_from: "client" })
    .select("id")
    .single();
  const first = [title, where, more].filter(Boolean).join("\n\n");
  if (thread) await admin.from("thread_messages").insert({ thread_id: thread.id, from_team: false, author_id: ctx.user.id, author_name: name, body: first.slice(0, 4000) });
  await admin.from("project_updates").insert({ project_id: project.id, business_id: biz.id, kind: "request", created_by: ctx.user.id });
  await addActivity(biz.id, ctx.user.id, "project_requested", { project: title });
  await notifyTeam("new_project", { business: biz.name, project: title }, `/console/team/inbox?item=${thread ? thread.id : ""}`, { except: ctx.user.id });
  return json({ ok: true, id: project.id });
}
