import { clientIp, json, readJson, str } from "@/lib/http";
import { formLimit } from "@/lib/rateLimit";
import { keepNotify } from "@/lib/store";
import { isEmail } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request) {
  if (!formLimit(clientIp(request)).ok) return json({ ok: false, error: "busy" }, 429);
  const body = await readJson(request, 2 * 1024);
  if (body.error) return json({ ok: false, error: body.error }, body.error === "too_large" ? 413 : 400);
  const data = body.data && typeof body.data === "object" ? body.data : {};

  const email = str(data.email).trim().toLowerCase();
  if (!isEmail(email)) return json({ ok: false, error: "email" }, 400);
  const source = str(data.source).replace(/[^\w:-]/g, "").slice(0, 60) || "site";

  const kept = await keepNotify(email, source);
  return kept ? json({ ok: true }) : json({ ok: false, error: "not_saved" }, 502);
}
