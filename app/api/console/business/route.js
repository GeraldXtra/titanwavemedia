import copy from "@/content/console/settings";
import { guard } from "@/lib/api";
import { addActivity } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request) {
  const { ctx, res } = await guard(request, { owner: true });
  if (res) return res;
  const body = await readJson(request, 4 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const name = str(data.name).trim().slice(0, 120);
  if (!name) return json({ ok: false, message: copy.profile.errors.business }, 400);
  const { error } = await getAdmin()
    .from("businesses")
    .update({ name, phone: str(data.phone).trim().slice(0, 40) || null, address: str(data.address).trim().slice(0, 300) || null, updated_at: new Date().toISOString() })
    .eq("id", ctx.business.id);
  if (error) return json({ ok: false, message: copy.failed }, 502);
  await addActivity(ctx.business.id, ctx.user.id, "business_updated", {});
  return json({ ok: true });
}
