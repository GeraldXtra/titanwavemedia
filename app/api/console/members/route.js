import copy from "@/content/console/settings";
import { guard } from "@/lib/api";
import { cleanEmail, sendSignInLink } from "@/lib/auth";
import { addActivity } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import { isEmail } from "@/lib/validate";

export const runtime = "nodejs";
const t = copy.team;

export async function POST(request) {
  const { ctx, res } = await guard(request, { owner: true });
  if (res) return res;
  const body = await readJson(request, 2 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const email = cleanEmail(data.email);
  const role = data.role === "owner" ? "owner" : "member";
  if (!isEmail(email)) return json({ ok: false, message: t.errors.email }, 400);
  if (email === ctx.email) return json({ ok: false, message: t.errors.self }, 400);

  const admin = getAdmin();
  const { data: existing } = await admin.from("business_members").select("business_id, joined_at").eq("email", email).maybeSingle();
  if (existing) {
    if (existing.business_id === ctx.business.id) return json({ ok: false, message: format(t.errors.already, { email }) }, 409);
    if (existing.joined_at) return json({ ok: false, message: format(t.errors.elsewhere, { email }) }, 409);
    await admin.from("business_members").delete().eq("email", email).is("joined_at", null);
  }
  const { data: row, error } = await admin.from("business_members").insert({ business_id: ctx.business.id, email, role, invited_by: ctx.user.id }).select("id").single();
  if (error) {
    console.error("[members] invite:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
  try {
    const inviter = (ctx.profile.full_name || "").trim() || ctx.email;
    const { userId } = await sendSignInLink({ email, purpose: "invite", template: "team_invite", data: { inviter, team: ctx.business.name } });
    if (userId) await admin.from("business_members").update({ user_id: userId }).eq("id", row.id);
  } catch (e) {
    console.error("[members] invite email:", e.message);
  }
  await addActivity(ctx.business.id, ctx.user.id, "member_invited", { email });
  return json({ ok: true, message: format(t.invited, { email }) });
}

export async function DELETE(request) {
  const { ctx, res } = await guard(request, { owner: true });
  if (res) return res;
  const body = await readJson(request, 1024);
  const id = str(body.data && body.data.id);
  const admin = getAdmin();
  const { data: m } = await admin.from("business_members").select("id, email, role, user_id").eq("id", id).eq("business_id", ctx.business.id).maybeSingle();
  if (!m) return json({ ok: false, message: copy.failed }, 404);
  if (m.user_id === ctx.user.id) return json({ ok: false, message: t.errors.self }, 400);
  if (m.role === "owner") {
    const { count } = await admin.from("business_members").select("id", { count: "exact", head: true }).eq("business_id", ctx.business.id).eq("role", "owner").not("joined_at", "is", null);
    if ((count || 0) <= 1) return json({ ok: false, message: t.errors.lastOwner }, 409);
  }
  await admin.from("business_members").delete().eq("id", m.id);
  if (m.user_id) await admin.from("notifications").delete().eq("user_id", m.user_id).eq("audience", "client");
  await addActivity(ctx.business.id, ctx.user.id, "member_removed", { email: m.email });
  return json({ ok: true, message: format(t.removed, { email: m.email }) });
}
