import "server-only";
import { guard } from "../api";
import { logAction } from "../audit";
import { json, readJson } from "../http";
import { getAdmin } from "../supabase";
import { ensureAssistant, forgetAssistant } from "./store";

// The business's assistant, made the first time it is needed. Null only when the business has
// gone.
export { ensureAssistant };

// The start of every Wave Assist action in the console, under /api/console/assist/.
// - Without `business` in the body, it is for the person's own business. Any joined member may
//   act, except where `owner` says only an owner may.
// - With { business: id }, it is a team request from Team view: team only, for that business,
//   and the action goes in the team log.
// Returns { ctx, data, team, business: { id, name } } when the action may go on, or { res } to
// send back.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const isUuid = (v) => typeof v === "string" && UUID.test(v);

export async function assistAction(request, max, { owner = false } = {}) {
  const first = await guard(request);
  if (first.res) return { res: first.res };
  const body = await readJson(request, max);
  if (body.error) return { res: json({ ok: false, error: body.error }, body.error === "too_large" ? 413 : 400) };
  const data = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : null;
  if (!data) return { res: json({ ok: false, error: "invalid" }, 400) };

  if (data.business !== undefined) {
    const { ctx, res } = await guard(request, { team: true });
    if (res) return { res };
    if (!isUuid(data.business)) return { res: json({ ok: false, error: "not_found" }, 404) };
    const { data: business, error } = await getAdmin().from("businesses").select("id, name").eq("id", data.business).maybeSingle();
    if (error) {
      console.error("[assist console] business:", error.message);
      return { res: json({ ok: false, error: "failed" }, 502) };
    }
    if (!business) return { res: json({ ok: false, error: "not_found" }, 404) };
    return { ctx, data, team: true, business };
  }

  const { ctx, res } = await guard(request, { business: true, owner });
  if (res) return { res };
  return { ctx, data, team: false, business: { id: ctx.business.id, name: ctx.business.name } };
}

// After a change: this server stops using its kept copy at once (others within a minute), and a
// team change goes in the team log with the business's name.
export async function afterChange({ ctx, team, business }, assistant, action, details = {}) {
  if (assistant && assistant.public_id) forgetAssistant(assistant.public_id);
  if (team) await logAction(ctx, action, business.name, details);
}
