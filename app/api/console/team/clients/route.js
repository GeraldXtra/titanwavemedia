import copy from "@/content/console/team-clients";
import { guard } from "@/lib/api";
import { logAction } from "@/lib/audit";
import { cleanEmail, sendSignInLink } from "@/lib/auth";
import { addActivity } from "@/lib/events";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import { isEmail } from "@/lib/validate";

export const runtime = "nodejs";

// "Invite a client": makes the business and its owner's account, and emails the welcome with a
// sign in link. They join when they first sign in.
export async function POST(request) {
  const { ctx, res } = await guard(request, { team: true });
  if (res) return res;
  const body = await readJson(request, 2 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const business = str(data.business).trim().slice(0, 120);
  const name = str(data.name).trim().slice(0, 120);
  const email = cleanEmail(data.email);
  const e = copy.invite.errors;
  if (!business) return json({ ok: false, field: "business", message: e.business }, 400);
  if (!name) return json({ ok: false, field: "name", message: e.name }, 400);
  if (!isEmail(email)) return json({ ok: false, field: "email", message: e.email }, 400);

  const admin = getAdmin();
  const { data: taken } = await admin.from("business_members").select("id, joined_at").eq("email", email).maybeSingle();
  if (taken && taken.joined_at) return json({ ok: false, field: "email", message: format(e.taken, { email }) }, 409);
  if (taken) await admin.from("business_members").delete().eq("id", taken.id);

  const { data: biz, error } = await admin.from("businesses").insert({ name: business, created_by: ctx.user.id }).select("id").single();
  if (error) {
    console.error("[clients] invite:", error.message);
    return json({ ok: false, message: e.failed }, 502);
  }
  const { data: member } = await admin.from("business_members").insert({ business_id: biz.id, email, role: "owner", invited_by: ctx.user.id }).select("id").single();
  try {
    const { userId } = await sendSignInLink({
      email,
      purpose: "welcome",
      template: "welcome",
      metadata: { full_name: name },
      data: { first: name.split(/\s+/)[0], business },
    });
    if (userId) {
      await admin.from("business_members").update({ user_id: userId }).eq("id", member.id);
      // The welcome has gone out, so it is not sent again at their first sign in.
      await admin.from("profiles").update({ full_name: name, welcomed_at: new Date().toISOString() }).eq("user_id", userId);
    }
  } catch (err) {
    console.error("[clients] welcome email:", err.message);
    return json({ ok: false, message: e.failed }, 502);
  }
  await addActivity(biz.id, ctx.user.id, "account_created", {});
  await logAction(ctx, "client_invited", business, { email });
  return json({ ok: true, message: format(copy.invite.sent, { email }) });
}
