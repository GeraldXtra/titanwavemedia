import copy from "@/content/console/signin";
import { accountsReady } from "@/lib/accounts";
import { cleanEmail, lastLinkAt, RESEND_SECONDS, sendSignInLink } from "@/lib/auth";
import { clientIp, json, readJson, str } from "@/lib/http";
import { check, hit } from "@/lib/limits";
import { sameOrigin } from "@/lib/security";
import { format } from "@/lib/text";
import { isEmail } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);
  if (!accountsReady()) return json({ ok: false, error: "off" }, 503);
  const body = await readJson(request, 4 * 1024);
  if (body.error) return json({ ok: false, error: body.error }, body.error === "too_large" ? 413 : 400);
  const data = body.data && typeof body.data === "object" ? body.data : {};

  const signup = data.intent === "signup";
  const email = cleanEmail(data.email);
  const name = str(data.name).trim().slice(0, 120);
  const business = str(data.business).trim().slice(0, 120);
  const errors = {};
  if (signup && !name) errors.name = copy.errors.name;
  if (signup && !business) errors.business = copy.errors.business;
  if (!email) errors.email = copy.errors.email;
  else if (!isEmail(email)) errors.email = copy.errors.emailFormat;
  if (signup && data.terms !== true) errors.terms = copy.errors.terms;
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const ip = clientIp(request);
  try {
    const network = await check("linkNetwork", ip);
    if (!network.ok) return json({ ok: false, error: "too_many", message: copy.errors.tooManyNetwork }, 429, { "Retry-After": String(network.retryAfter) });
    const perEmail = await check("linkEmail", email);
    if (!perEmail.ok) return json({ ok: false, error: "too_many", message: copy.errors.tooManyEmail }, 429, { "Retry-After": String(perEmail.retryAfter) });
    const waited = Math.floor((Date.now() - (await lastLinkAt(email))) / 1000);
    if (waited < RESEND_SECONDS) {
      const seconds = RESEND_SECONDS - waited;
      return json({ ok: false, error: "wait", seconds, message: format(copy.errors.wait, { seconds }) }, 429, { "Retry-After": String(seconds) });
    }

    await sendSignInLink({
      email,
      purpose: signup ? "signup" : "signin",
      userAgent: request.headers.get("user-agent"),
      metadata: signup ? { full_name: name, pending_business: business } : undefined,
    });
    await Promise.all([hit("linkNetwork", ip), hit("linkEmail", email)]);
    return json({ ok: true, seconds: RESEND_SECONDS });
  } catch (e) {
    console.error("[auth] link:", e.message);
    return json({ ok: false, error: "failed", message: copy.errors.failed }, 502);
  }
}
