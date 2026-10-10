import { accountsReady } from "@/lib/accounts";
import { afterSignIn, landingFor, useLink } from "@/lib/auth";
import { json, readJson, str } from "@/lib/http";
import { sameOrigin } from "@/lib/security";
import { createUserClient, markSession } from "@/lib/supabaseUser";

export const runtime = "nodejs";

export async function POST(request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);
  if (!accountsReady()) return json({ ok: false, error: "off" }, 503);
  const body = await readJson(request, 2 * 1024);
  const tokenHash = str(body.data && body.data.token_hash).trim();
  if (body.error || !/^[a-f0-9]{20,128}$/i.test(tokenHash)) return json({ ok: false, expired: true, email: "" }, 400);

  const link = await useLink(tokenHash);
  if (!link.ok) return json({ ok: false, expired: true, email: link.email });

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (error || !data || !data.user) {
    if (error) console.error("[auth] confirm:", error.code || error.message);
    return json({ ok: false, expired: true, email: link.email });
  }

  const user = data.user;
  await markSession();
  const twoStep = (user.factors || []).some((f) => f.factor_type === "totp" && f.status === "verified");
  if (twoStep) return json({ ok: true, next: "/signin/code" });

  try {
    await afterSignIn(user, { method: "link", userAgent: request.headers.get("user-agent") });
  } catch (e) {
    console.error("[auth] after sign in:", e.message);
  }
  return json({ ok: true, next: await landingFor(user) });
}
