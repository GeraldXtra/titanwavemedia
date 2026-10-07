import copy from "@/content/console/team-inbox";
import { guard } from "@/lib/api";
import { json, readJson, str } from "@/lib/http";
import { listInbox, threadDetail } from "@/lib/inbox";
import { getAdmin } from "@/lib/supabase";
import { teamReplyEffects } from "@/lib/teamReply";
import { addMessage } from "@/lib/threads";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { write: false, team: true });
  if (res) return res;
  if (id === "list") {
    const filter = new URL(request.url).searchParams.get("filter");
    return json({ ok: true, items: await listInbox(["new", "replied"].includes(filter) ? filter : "all") });
  }
  const detail = await threadDetail(id, ctx);
  if (!detail) return json({ ok: false, error: "not_found" }, 404);
  return json({ ok: true, ...detail });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { team: true });
  if (res) return res;
  const { data: thread } = await getAdmin().from("threads").select("*").eq("id", id).maybeSingle();
  if (!thread) return json({ ok: false, error: "not_found" }, 404);
  const body = await readJson(request, 16 * 1024);
  const text = str(body.data && body.data.body).trim().slice(0, 4000);
  if (!text) return json({ ok: false, message: copy.reply.failed }, 400);
  const name = (ctx.profile.full_name || "").trim() || ctx.email;
  try {
    await addMessage(thread, { fromTeam: true, userId: ctx.user.id, name, body: text });
  } catch (e) {
    console.error("[inbox] reply:", e.message);
    return json({ ok: false, message: copy.reply.failed }, 502);
  }
  await teamReplyEffects(thread, ctx, text);
  const detail = await threadDetail(id, ctx);
  return json({ ok: true, messages: detail.messages, status: detail.status });
}
