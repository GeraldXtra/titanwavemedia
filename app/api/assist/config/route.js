import { after } from "next/server";
import { chatRequest } from "@/lib/assist/request";
import { siteAllowsOrigin } from "@/lib/assist/sites";
import { loadAssistant, publicSettings } from "@/lib/assist/store";
import { chatToken, readToken } from "@/lib/assist/token";
import { clientIp, json, str } from "@/lib/http";
import { assistConfigLimit } from "@/lib/rateLimit";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const HOUR = 60 * 60 * 1000;
const seenWrites = new Map();

export async function POST(request) {
  const limit = assistConfigLimit(clientIp(request));
  if (!limit.ok) return json({ ok: false, error: "busy" }, 429, { "Retry-After": String(limit.retryAfter) });
  const { data, res } = await chatRequest(request, 4 * 1024, { token: false });
  if (res) return res;
  const id = str(data.id);
  const origin = str(data.origin).slice(0, 300);

  let assistant = null;
  let test = false;
  try {
    if (data.test) {
      const t = readToken(str(data.test));
      if (t && t.t === 1 && t.p === id) {
        assistant = await loadAssistant(id, { fresh: true });
        test = Boolean(assistant && assistant.id === t.a);
      }
      if (!test) return json({ ok: true, show: false, test: false, token: null });
    } else {
      assistant = await loadAssistant(id);
    }
  } catch (error) {
    console.error("[assist] config:", error.message);
    return json({ ok: false, error: "failed" }, 500);
  }
  if (!assistant) return json({ ok: true, show: false, test: false, token: null });

  const on = test || assistant.is_on;
  const show = test || (assistant.is_on && siteAllowsOrigin(assistant.sites, origin));

  if (show && !test) {
    const last = Math.max(Date.parse(assistant.seen_at || 0) || 0, seenWrites.get(assistant.id) || 0);
    if (Date.now() - last > HOUR) {
      seenWrites.set(assistant.id, Date.now());
      after(async () => {
        const { error } = await getAdmin()
          .from("assistants")
          .update({ seen_at: new Date().toISOString(), seen_site: new URL(origin).host })
          .eq("id", assistant.id);
        if (error) console.error("[assist] seen:", error.message);
      });
    }
  }

  return json({
    ok: true,
    show,
    test,
    token: on ? (test ? str(data.test) : chatToken(assistant)) : null,
    ...publicSettings(assistant),
  });
}
