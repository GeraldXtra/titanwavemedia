import copy from "@/content/console/assist";
import { afterChange, assistAction, ensureAssistant } from "@/lib/assist/consoleApi";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";

export async function POST(request) {
  const action = await assistAction(request, 1024);
  if (action.res) return action.res;
  const { ctx, data, team, business } = action;
  if (!team) return json({ ok: false, error: "forbidden" }, 403);
  const limit = typeof data.limit === "string" ? Number(data.limit.replace(/[\s,]/g, "")) : data.limit;
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 0 || limit > 1000000) {
    return json({ ok: false, message: copy.team.limitError }, 400);
  }

  try {
    const assistant = await ensureAssistant(business.id);
    if (!assistant) return json({ ok: false, error: "not_found" }, 404);
    const { error } = await getAdmin()
      .from("assistants")
      .update({ monthly_limit: limit, updated_by: ctx.user.id, updated_at: new Date().toISOString() })
      .eq("id", assistant.id);
    if (error) throw new Error(error.message);
    const shown = limit.toLocaleString("en-NG");
    await afterChange(action, assistant, "assist_limit", { limit: shown });
    return json({ ok: true, limit, message: format(copy.team.limitSaved, { limit: shown }) });
  } catch (error) {
    console.error("[assist console] limit:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
}
