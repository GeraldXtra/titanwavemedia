import copy from "@/content/console/signin";
import { accountsReady } from "@/lib/accounts";
import { afterSignIn, cleanEmail, firstStep, landingFor } from "@/lib/auth";
import { lagosDayTime } from "@/lib/format";
import { json, readJson, str } from "@/lib/http";
import { check, clear, hit } from "@/lib/limits";
import { sendEmail } from "@/lib/mail";
import { backupCodeMatches, cleanBackupCode, sameOrigin } from "@/lib/security";
import { siteUrl } from "@/lib/seo";
import { getAdmin } from "@/lib/supabase";
import { createUserClient } from "@/lib/supabaseUser";

export const runtime = "nodejs";

// The second step of signing in: the 6 digit code from an authenticator app, or a backup code.
// A backup code turns two step sign in off (and emails the person), so it can be set up again.
export async function POST(request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);
  if (!accountsReady()) return json({ ok: false, error: "off" }, 503);
  const body = await readJson(request, 2 * 1024);
  const data = body.data && typeof body.data === "object" ? body.data : {};

  const supabase = await createUserClient();
  const { data: got } = await supabase.auth.getUser();
  const user = got && got.user;
  if (!user) return json({ ok: false, next: "/signin" }, 401);
  const factors = (user.factors || []).filter((f) => f.factor_type === "totp" && f.status === "verified");
  if (!factors.length) return json({ ok: true, next: "/console" });

  const limit = await check("code", user.id);
  if (!limit.ok) return json({ ok: false, message: copy.errors.codeTooMany }, 429, { "Retry-After": String(limit.retryAfter) });

  const { data: claims } = await supabase.auth.getClaims();
  const first = firstStep(claims && claims.claims && claims.claims.amr);
  const userAgent = request.headers.get("user-agent");

  if (data.backup !== undefined) {
    const code = cleanBackupCode(str(data.backup));
    if (code.length !== 8) return json({ ok: false, message: copy.errors.backupLength }, 400);
    const admin = getAdmin();
    const { data: codes } = await admin.from("backup_codes").select("id, code_hash").eq("user_id", user.id).is("used_at", null);
    let match = null;
    for (const row of codes || []) {
      if (await backupCodeMatches(code, row.code_hash)) {
        match = row;
        break;
      }
    }
    if (!match) {
      await hit("code", user.id);
      return json({ ok: false, message: copy.errors.backupWrong }, 400);
    }
    // The backup code is used up, and two step sign in is removed.
    const { data: listed } = await admin.auth.admin.mfa.listFactors({ userId: user.id });
    for (const f of (listed && listed.factors) || []) await admin.auth.admin.mfa.deleteFactor({ userId: user.id, id: f.id });
    await admin.from("backup_codes").delete().eq("user_id", user.id);
    await clear("code", user.id);
    const { data: member } = await admin.from("business_members").select("business_id").eq("user_id", user.id).not("joined_at", "is", null).maybeSingle();
    if (member) await admin.from("activity").insert({ business_id: member.business_id, user_id: user.id, kind: "twostep_removed", data: {} });
    try {
      const { data: profile } = await admin.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      await sendEmail({
        to: cleanEmail(user.email),
        key: "twostep_removed",
        url: `${siteUrl}/console/settings?tab=security`,
        data: { first: ((profile && profile.full_name) || "").split(/\s+/)[0] || undefined, time: lagosDayTime(new Date()) },
      });
    } catch (e) {
      console.error("[auth] two step removed email:", e.message);
    }
    await afterSignIn(user, { method: `${first}_backup`, userAgent });
    return json({ ok: true, next: await landingFor(user), removed: true });
  }

  const code = str(data.code).replace(/\D/g, "");
  if (code.length !== 6) return json({ ok: false, message: copy.errors.codeLength }, 400);
  let verified = false;
  for (const f of factors) {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: f.id, code });
    if (!error) {
      verified = true;
      break;
    }
  }
  if (!verified) {
    await hit("code", user.id);
    return json({ ok: false, message: copy.errors.codeWrong }, 400);
  }
  await clear("code", user.id);
  await afterSignIn(user, { method: `${first}_code`, userAgent });
  return json({ ok: true, next: await landingFor(user) });
}
