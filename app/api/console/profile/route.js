import copy from "@/content/console/settings";
import { guard } from "@/lib/api";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Your name, from Settings, Profile.
export async function POST(request) {
  const { ctx, res } = await guard(request);
  if (res) return res;
  const body = await readJson(request, 2 * 1024);
  const name = str(body.data && body.data.name).trim().slice(0, 120);
  if (!name) return json({ ok: false, message: copy.profile.errors.name }, 400);
  const { error } = await getAdmin().from("profiles").update({ full_name: name, updated_at: new Date().toISOString() }).eq("user_id", ctx.user.id);
  return error ? json({ ok: false, message: copy.failed }, 502) : json({ ok: true });
}
