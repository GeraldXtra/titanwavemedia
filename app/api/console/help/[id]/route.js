import copy from "@/content/console/help";
import { guard } from "@/lib/api";
import { notifyTeam } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { addMessage, loadMessages, shapeMessages } from "@/lib/threads";

export const runtime = "nodejs";

async function ticket(ctx, id) {
  if (!/^[0-9a-f-]{36}$/i.test(id) || !ctx.business) return null;
  const { data } = await getAdmin().from("threads").select("*").eq("id", id).eq("kind", "help").eq("business_id", ctx.business.id).maybeSingle();
  return data;
}

const shaped = async (t, ctx) => shapeMessages(await loadMessages(t.id), { viewer: "client", userId: ctx.user.id, you: copy.ticket.you });

export async function GET(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { write: false, business: true });
  if (res) return res;
  const t = await ticket(ctx, id);
  if (!t) return json({ ok: false, error: "not_found" }, 404);
  return json({ ok: true, messages: await shaped(t, ctx), status: t.status });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { business: true });
  if (res) return res;
  const t = await ticket(ctx, id);
  if (!t) return json({ ok: false, error: "not_found" }, 404);
  const body = await readJson(request, 16 * 1024);
  const text = str(body.data && body.data.body).trim().slice(0, 4000);
  if (!text) return json({ ok: false, message: copy.ticket.failed }, 400);
  const name = (ctx.profile.full_name || "").trim() || ctx.email;
  try {
    await addMessage(t, { fromTeam: false, userId: ctx.user.id, name, body: text });
  } catch (e) {
    console.error("[help reply]", e.message);
    return json({ ok: false, message: copy.ticket.failed }, 502);
  }
  await notifyTeam("ticket_message", { business: ctx.business.name, subject: t.subject }, `/console/team/inbox?item=${t.id}`, { except: ctx.user.id });
  return json({ ok: true, messages: await shaped(t, ctx) });
}
