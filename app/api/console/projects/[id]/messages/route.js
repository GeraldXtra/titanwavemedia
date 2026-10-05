import copy from "@/content/console/project";
import { guard } from "@/lib/api";
import { notifyTeam } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { projectAccess } from "@/lib/projects";
import { getAdmin } from "@/lib/supabase";
import { teamReplyEffects } from "@/lib/teamReply";
import { addMessage, loadMessages, shapeMessages } from "@/lib/threads";

export const runtime = "nodejs";

async function projectThread(project, ctx) {
  const admin = getAdmin();
  const { data } = await admin.from("threads").select("*").eq("project_id", project.id).eq("kind", "project").maybeSingle();
  if (data) return data;
  const { data: made } = await admin
    .from("threads")
    .insert({ kind: "project", status: "replied", business_id: project.business_id, project_id: project.id, subject: project.title, from_email: ctx.email, last_from: "team" })
    .select("*")
    .single();
  return made;
}

const shaped = async (thread, ctx, side) =>
  shapeMessages(await loadMessages(thread.id), { viewer: side, userId: ctx.user.id, you: copy.chat.you });

// The project chat, from the client's side or ours.
export async function GET(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { write: false });
  if (res) return res;
  const access = await projectAccess(ctx, id);
  if (!access) return json({ ok: false, error: "not_found" }, 404);
  const thread = await projectThread(access.project, ctx);
  return json({ ok: true, messages: await shaped(thread, ctx, access.side) });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request);
  if (res) return res;
  const access = await projectAccess(ctx, id);
  if (!access) return json({ ok: false, error: "not_found" }, 404);
  const { project, side } = access;
  const body = await readJson(request, 16 * 1024);
  const text = str(body.data && body.data.body).trim().slice(0, 4000);
  if (!text) return json({ ok: false, message: copy.chat.failed }, 400);

  const thread = await projectThread(project, ctx);
  const name = (ctx.profile.full_name || "").trim() || ctx.email;
  const fromTeam = side === "team";
  try {
    await addMessage(thread, { fromTeam, userId: ctx.user.id, name, body: text });
  } catch (e) {
    console.error("[project chat]", e.message);
    return json({ ok: false, message: copy.chat.failed }, 502);
  }

  if (fromTeam) {
    // A reply from us: the client's people hear about it, and get an email if they want one.
    await teamReplyEffects(thread, ctx, text);
  } else {
    await notifyTeam("project_message", { business: ctx.business.name, project: project.title }, `/console/team/inbox?item=${thread.id}`, { except: ctx.user.id });
  }
  return json({ ok: true, messages: await shaped(thread, ctx, side) });
}
