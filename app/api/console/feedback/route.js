import shell from "@/content/console/shell";
import { guard } from "@/lib/api";
import { notifyTeam } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request) {
  const { ctx, res } = await guard(request);
  if (res) return res;
  const body = await readJson(request, 8 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const kind = shell.feedback.kinds.includes(data.kind) ? data.kind : shell.feedback.kinds[shell.feedback.kinds.length - 1];
  const message = str(data.message).trim().slice(0, 2000);
  const page = str(data.page).replace(/[^\w/-]/g, "").slice(0, 120);
  if (message.length < 3) return json({ ok: false, message: shell.feedback.short }, 400);

  const admin = getAdmin();
  const name = (ctx.profile.full_name || "").trim() || ctx.email;
  const now = new Date().toISOString();
  const { data: thread, error } = await admin
    .from("threads")
    .insert({
      kind: "feedback",
      status: "new",
      business_id: ctx.business ? ctx.business.id : null,
      subject: kind,
      from_name: name,
      from_email: ctx.email,
      details: { kind, page, business: ctx.business ? ctx.business.name : null },
      created_by: ctx.user.id,
      last_message_at: now,
      last_from: "client",
    })
    .select("id")
    .single();
  if (error) {
    console.error("[feedback]", error.message);
    return json({ ok: false, message: shell.failed }, 502);
  }
  await admin.from("thread_messages").insert({ thread_id: thread.id, from_team: false, author_id: ctx.user.id, author_name: name, body: message });
  await notifyTeam("new_feedback", { subject: kind }, `/console/team/inbox?item=${thread.id}`, { except: ctx.user.id });
  return json({ ok: true });
}
