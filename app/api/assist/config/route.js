import { after } from "next/server";
import { chatRequest } from "@/lib/assist/request";
import { siteAllowsOrigin } from "@/lib/assist/sites";
import { loadAssistant, publicSettings } from "@/lib/assist/store";
import { chatToken, readToken } from "@/lib/assist/token";
import { json, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const HOUR = 60 * 60 * 1000;
// When this server last noted each assistant being seen, so it writes at most once an hour.
const seenWrites = new Map();

// The chat page asks for its settings here when it loads: { id, test?, origin }, where origin is
// the address of the business's page it sits in. Returns { ok, show, test, token, name,
// greeting, starters, color, textColor, corner, whatsapp, phone, email, sites }.
// - show: whether the button should appear on that page. False when the assistant is missing,
//   switched off, or the page is not one of its websites. A test chat always shows.
// - token: for the chat calls, when the assistant is on (or for a test). Null otherwise.
export async function POST(request) {
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

  // The console shows when the chat last opened on one of the business's websites.
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
