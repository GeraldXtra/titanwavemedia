import { guard } from "@/lib/api";
import { json, readJson } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const KEYS = ["notify_projects", "notify_billing", "notify_news"];

export async function POST(request) {
  const { ctx, res } = await guard(request);
  if (res) return res;
  const body = await readJson(request, 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  if (!KEYS.includes(data.key) || typeof data.on !== "boolean") return json({ ok: false }, 400);
  const { error } = await getAdmin().from("profiles").update({ [data.key]: data.on, updated_at: new Date().toISOString() }).eq("user_id", ctx.user.id);
  return error ? json({ ok: false }, 502) : json({ ok: true });
}
