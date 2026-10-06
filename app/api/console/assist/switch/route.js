import copy from "@/content/console/assist";
import { afterChange, assistAction, ensureAssistant } from "@/lib/assist/consoleApi";
import { addActivity } from "@/lib/events";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Switches Wave Assist on or off: { on: true | false }. Off, the chat leaves the business's
// websites within a minute; the test chat in the console still works.
export async function POST(request) {
  const action = await assistAction(request, 1024);
  if (action.res) return action.res;
  const { ctx, data, business } = action;
  if (typeof data.on !== "boolean") return json({ ok: false, error: "invalid" }, 400);

  try {
    const assistant = await ensureAssistant(business.id);
    if (!assistant) return json({ ok: false, error: "not_found" }, 404);
    const { error } = await getAdmin()
      .from("assistants")
      .update({ is_on: data.on, updated_by: ctx.user.id, updated_at: new Date().toISOString() })
      .eq("id", assistant.id);
    if (error) throw new Error(error.message);
    const kind = data.on ? "assist_on" : "assist_off";
    await addActivity(business.id, ctx.user.id, kind, {});
    await afterChange(action, assistant, kind);
    return json({ ok: true, on: data.on, message: data.on ? copy.switch.turnedOn : copy.switch.turnedOff });
  } catch (error) {
    console.error("[assist console] switch:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
}
