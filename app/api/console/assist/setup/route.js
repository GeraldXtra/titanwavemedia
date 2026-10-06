import copy from "@/content/console/assist";
import { afterChange, assistAction, ensureAssistant } from "@/lib/assist/consoleApi";
import { checkSetup } from "@/lib/assist/setup";
import { addActivity } from "@/lib/events";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Saves Wave Assist's setup: the business's details, the questions and answers, anything else
// it should know, the greeting and starter questions, the button and the websites. Everything is
// checked again here with the same rules as the form. Returns { ok, message, values } with what
// was saved (the colour may have moved to reach 4.6:1), or { ok: false, errors } with the codes
// from lib/assist/setup.js.
export async function POST(request) {
  const action = await assistAction(request, 400 * 1024);
  if (action.res) return action.res;
  const { ctx, data, business } = action;

  const { ok, values, errors } = checkSetup(data);
  if (!ok) return json({ ok: false, errors, message: copy.setup.errors.summary }, 400);

  try {
    const assistant = await ensureAssistant(business.id);
    if (!assistant) return json({ ok: false, error: "not_found" }, 404);
    const { error } = await getAdmin()
      .from("assistants")
      .update({
        name: values.name,
        sells: values.sells,
        prices: values.prices,
        hours: values.hours,
        areas: values.areas,
        whatsapp: values.whatsapp,
        phone: values.phone,
        email: values.email,
        qa: values.qa,
        extra: values.extra,
        greeting: values.greeting,
        starters: values.starters,
        color: values.color,
        text_color: values.textColor,
        corner: values.corner,
        sites: values.sites,
        updated_by: ctx.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assistant.id);
    if (error) throw new Error(error.message);
    await addActivity(business.id, ctx.user.id, "assist_setup", {});
    await afterChange(action, assistant, "assist_setup");
    return json({ ok: true, message: copy.setup.saved, values });
  } catch (error) {
    console.error("[assist console] setup:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
}
