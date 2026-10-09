import { guard } from "@/lib/api";
import { lagosClock } from "@/lib/format";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { setting } from "@/lib/settings.mjs";

export const runtime = "nodejs";

let last = null;

async function checkDatabase() {
  try {
    const { error } = await getAdmin().from("counters").select("name", { head: true, count: "exact" });
    return !error;
  } catch {
    return false;
  }
}

async function checkPaystack() {
  try {
    const res = await fetch("https://api.paystack.co/balance", {
      headers: { Authorization: `Bearer ${setting("PAYSTACK_SECRET_KEY")}` },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data && data.status === true;
  } catch {
    return false;
  }
}

export async function GET(request) {
  const { res } = await guard(request, { write: false });
  if (res) return res;
  if (!last || Date.now() - last.at > 60000) {
    const [database, payments] = await Promise.all([checkDatabase(), checkPaystack()]);
    last = { at: Date.now(), checks: { database, payments } };
  }
  const ok = Object.values(last.checks).every(Boolean);
  return json({ ok, checks: last.checks, checkedAt: lagosClock(new Date(last.at)) });
}
