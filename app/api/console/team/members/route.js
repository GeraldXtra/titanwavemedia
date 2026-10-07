import copy from "@/content/console/team-members";
import { guard } from "@/lib/api";
import { logAction } from "@/lib/audit";
import { cleanEmail, sendSignInLink } from "@/lib/auth";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import { isEmail } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request) {
  const { ctx, res } = await guard(request, { siteOwner: true });
  if (res) return res;
  const body = await readJson(request, 2 * 1024);
  const email = cleanEmail(body.data && body.data.email);
  if (!isEmail(email)) return json({ ok: false, message: copy.errors.email }, 400);
  if (email === ctx.email) return json({ ok: false, message: copy.errors.owner }, 400);

  const admin = getAdmin();
  const { error } = await admin.from("team_members").insert({ email, added_by: ctx.user.id });
  if (error) {
    if (error.code === "23505") return json({ ok: false, message: copy.errors.already }, 409);
    console.error("[team] add:", error.message);
    return json({ ok: false, message: copy.errors.failed }, 502);
  }
  try {
    const inviter = (ctx.profile.full_name || "").trim() || ctx.email;
    const { userId } = await sendSignInLink({ email, purpose: "invite", template: "team_invite", data: { inviter, team: copy.teamName } });
    if (userId) await admin.from("team_members").update({ user_id: userId }).eq("email", email);
  } catch (e) {
    console.error("[team] invite email:", e.message);
  }
  await logAction(ctx, "member_added", email);
  return json({ ok: true, message: format(copy.done.added, { email }) });
}

export async function DELETE(request) {
  const { ctx, res } = await guard(request, { siteOwner: true });
  if (res) return res;
  const body = await readJson(request, 2 * 1024);
  const id = str(body.data && body.data.id);
  const admin = getAdmin();
  const { data: row } = await admin.from("team_members").select("id, email, user_id").eq("id", id).maybeSingle();
  if (!row) return json({ ok: false, message: copy.errors.failed }, 404);
  await admin.from("team_members").delete().eq("id", row.id);
  if (row.user_id) await admin.from("notifications").delete().eq("user_id", row.user_id).eq("audience", "team");
  await logAction(ctx, "member_removed", row.email);
  return json({ ok: true, message: format(copy.done.removed, { email: row.email }) });
}
