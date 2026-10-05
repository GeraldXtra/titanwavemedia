import { accountsReady } from "@/lib/accounts";
import { runDaily } from "@/lib/daily";
import { json } from "@/lib/http";
import { safeEqual } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

// The daily job. Vercel Cron calls it at 07:00 UTC, which is 8 am in Lagos (vercel.json), with
// "Authorization: Bearer <CRON_SECRET>". Anything else is refused.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return json({ ok: false }, 401);
  if (!accountsReady()) return json({ ok: false, error: "off" }, 503);
  const check = new URL(request.url).searchParams.get("check") === "1";
  const result = await runDaily({ check });
  return json(result, result.ok ? 200 : 500);
}
