import copy from "@/content/console/assist";
import { afterChange, assistAction, ensureAssistant } from "@/lib/assist/consoleApi";
import { questionKey } from "@/lib/assist/privacy";
import { MAX, MAX_QA } from "@/lib/assist/setup";
import { addActivity } from "@/lib/events";
import { json, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// "Add an answer" on a question it couldn't answer: { key, question, answer }. The question and
// answer join the setup's questions and answers (refused when there are 50 already); when the
// same question is already there, its answer is replaced instead. Every customer message asked
// that way is marked as answered, so it leaves the list.
export async function POST(request) {
  const action = await assistAction(request, 16 * 1024);
  if (action.res) return action.res;
  const { ctx, data, business } = action;
  const e = copy.questions.errors;
  const key = questionKey(str(data.key));
  const q = str(data.question).replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
  const a = str(data.answer).replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim();
  const errors = {};
  if (!q) errors.question = e.question;
  if (!a) errors.answer = e.answer;
  if (q.length > MAX.question) errors.question = e.long;
  if (a.length > MAX.answer) errors.answer = e.long;
  if (!key) return json({ ok: false, error: "invalid" }, 400);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const admin = getAdmin();
  try {
    // Saved only if nobody changed the setup since it was read; one more try if they did.
    let assistant = null;
    let saved = false;
    for (let tries = 0; tries < 2 && !saved; tries++) {
      assistant = await ensureAssistant(business.id);
      if (!assistant) return json({ ok: false, error: "not_found" }, 404);
      const qa = Array.isArray(assistant.qa) ? assistant.qa : [];
      const same = qa.findIndex((p) => p && questionKey(p.q) === questionKey(q));
      if (same < 0 && qa.length >= MAX_QA) return json({ ok: false, message: copy.questions.full }, 409);
      const next = same < 0 ? [...qa, { q, a }] : qa.map((p, i) => (i === same ? { q, a } : p));
      const { data: rows, error } = await admin
        .from("assistants")
        .update({ qa: next, updated_by: ctx.user.id, updated_at: new Date().toISOString() })
        .eq("id", assistant.id)
        .eq("updated_at", assistant.updated_at)
        .select("id");
      if (error) throw new Error(error.message);
      saved = Boolean(rows && rows.length);
    }
    if (!saved) return json({ ok: false, message: copy.failed }, 409);

    const { error } = await admin
      .from("assist_messages")
      .update({ resolved_at: new Date().toISOString() })
      .eq("business_id", business.id)
      .eq("role", "customer")
      .eq("question_key", key)
      .is("resolved_at", null);
    if (error) console.error("[assist console] answer resolve:", error.message);

    await addActivity(business.id, ctx.user.id, "assist_answer", { question: q.slice(0, 120) });
    await afterChange(action, assistant, "assist_answer", { question: q.slice(0, 120) });
    return json({ ok: true, message: copy.questions.added });
  } catch (error) {
    console.error("[assist console] answer:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
}
