import copy from "@/content/console/signin";
import { guard } from "@/lib/api";
import { json, readJson, str } from "@/lib/http";
import { check, clear, hit } from "@/lib/limits";
import { hashBackupCode, newBackupCodes, showBackupCode } from "@/lib/security";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { action } = await params;
  const { ctx, res } = await guard(request);
  if (res) return res;
  const admin = getAdmin();
  const supabase = ctx.supabase;
  const body = await readJson(request, 2 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};

  if (action === "start") {
    if (ctx.twoStep) return json({ ok: false, error: "already_on" }, 409);
    const { data: listed } = await admin.auth.admin.mfa.listFactors({ userId: ctx.user.id });
    for (const f of (listed && listed.factors) || []) {
      if (f.status !== "verified") await admin.auth.admin.mfa.deleteFactor({ userId: ctx.user.id, id: f.id });
    }
    const { data: enrolled, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${Date.now()}`, issuer: "Titan Wave Media" });
    if (error || !enrolled) {
      console.error("[security] enroll:", error && error.message);
      return json({ ok: false, error: "failed" }, 502);
    }
    return json({ ok: true, factorId: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret });
  }

  if (action === "confirm") {
    const factorId = str(data.factorId);
    const code = str(data.code).replace(/\D/g, "");
    if (code.length !== 6) return json({ ok: false, message: copy.errors.codeLength }, 400);
    const limit = await check("code", ctx.user.id);
    if (!limit.ok) return json({ ok: false, message: copy.errors.codeTooMany }, 429);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) {
      await hit("code", ctx.user.id);
      return json({ ok: false, message: copy.errors.codeWrong }, 400);
    }
    await clear("code", ctx.user.id);
    const codes = await saveBackupCodes(ctx.user.id);
    if (ctx.business) await admin.from("activity").insert({ business_id: ctx.business.id, user_id: ctx.user.id, kind: "twostep_on", data: {} });
    return json({ ok: true, codes });
  }

  if (action === "codes") {
    if (!ctx.twoStep) return json({ ok: false, error: "off" }, 409);
    return json({ ok: true, codes: await saveBackupCodes(ctx.user.id) });
  }

  if (action === "off") {
    for (const f of ctx.factors) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
      if (error) {
        console.error("[security] unenroll:", error.message);
        return json({ ok: false, error: "failed" }, 502);
      }
    }
    await admin.from("backup_codes").delete().eq("user_id", ctx.user.id);
    if (ctx.business) await admin.from("activity").insert({ business_id: ctx.business.id, user_id: ctx.user.id, kind: "twostep_off", data: {} });
    return json({ ok: true });
  }

  return json({ ok: false, error: "not_found" }, 404);
}

async function saveBackupCodes(userId) {
  const admin = getAdmin();
  const codes = newBackupCodes(10);
  const rows = await Promise.all(codes.map(async (c) => ({ user_id: userId, code_hash: await hashBackupCode(c) })));
  await admin.from("backup_codes").delete().eq("user_id", userId);
  const { error } = await admin.from("backup_codes").insert(rows);
  if (error) throw new Error(`backup codes: ${error.message}`);
  return codes.map(showBackupCode);
}
