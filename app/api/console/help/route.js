import copy from "@/content/console/help";
import { guard } from "@/lib/api";
import { addActivity, notifyTeam } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request) {
  const { ctx, res } = await guard(request, { business: true });
  if (res) return res;
  const body = await readJson(request, 16 * 1024);
  const subject = str(body.data && body.data.subject).trim().slice(0, 200);
  const message = str(body.data && body.data.message).trim().slice(0, 4000);
  if (!subject) return json({ ok: false, message: copy.form.errors.subject }, 400);
  if (message.length < 10) return json({ ok: false, message: copy.form.errors.message }, 400);

  const admin = getAdmin();
  const name = (ctx.profile.full_name || "").trim() || ctx.email;
  const now = new Date().toISOString();
  const { data: thread, error } = await admin
    .from("threads")
    .insert({ kind: "help", status: "new", business_id: ctx.business.id, subject, from_name: name, from_email: ctx.email, created_by: ctx.user.id, last_message_at: now, last_from: "client" })
    .select("id")
    .single();
  if (error) {
    console.error("[help]", error.message);
    return json({ ok: false, message: copy.form.errors.failed }, 502);
  }
  await admin.from("thread_messages").insert({ thread_id: thread.id, from_team: false, author_id: ctx.user.id, author_name: name, body: message });
  await addActivity(ctx.business.id, ctx.user.id, "ticket_opened", { subject });
  await notifyTeam("new_ticket", { business: ctx.business.name, subject }, `/console/team/inbox?item=${thread.id}`, { except: ctx.user.id });
  return json({ ok: true, id: thread.id });
}
