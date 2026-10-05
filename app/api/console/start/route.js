import { guard } from "@/lib/api";
import { addActivity } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import copy from "@/content/console/start";

export const runtime = "nodejs";

// Makes the business for someone who has none yet, with them as its owner.
export async function POST(request) {
  const { ctx, res } = await guard(request);
  if (res) return res;
  if (ctx.business) return json({ ok: true });
  const body = await readJson(request, 2 * 1024);
  const name = str(body.data && body.data.name).trim().slice(0, 120);
  const business = str(body.data && body.data.business).trim().slice(0, 120);
  if (!name || !business) return json({ ok: false, message: !name ? copy.errors.name : copy.errors.business }, 400);

  const admin = getAdmin();
  // An invite waiting for this email is taken as the person's choice not to join it.
  await admin.from("business_members").delete().eq("email", ctx.email).is("joined_at", null);
  const { data: biz, error } = await admin.from("businesses").insert({ name: business, created_by: ctx.user.id }).select("id").single();
  if (error) {
    console.error("[start]", error.message);
    return json({ ok: false, message: copy.errors.failed }, 502);
  }
  const { error: memberError } = await admin
    .from("business_members")
    .insert({ business_id: biz.id, user_id: ctx.user.id, email: ctx.email, role: "owner", joined_at: new Date().toISOString() });
  if (memberError) {
    await admin.from("businesses").delete().eq("id", biz.id);
    console.error("[start] member:", memberError.message);
    return json({ ok: false, message: copy.errors.failed }, 502);
  }
  await admin.from("profiles").update({ full_name: name, updated_at: new Date().toISOString() }).eq("user_id", ctx.user.id);
  await addActivity(biz.id, ctx.user.id, "account_created", {});
  return json({ ok: true });
}
