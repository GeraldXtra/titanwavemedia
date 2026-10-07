import "server-only";
import { guard } from "../api";
import { logAction } from "../audit";
import { json, readJson } from "../http";
import { getAdmin } from "../supabase";
import { ensureAssistant, forgetAssistant } from "./store";

export { ensureAssistant };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const isUuid = (v) => typeof v === "string" && UUID.test(v);

export async function assistAction(request, max, { owner = false } = {}) {
  const first = await guard(request);
  if (first.res) return { res: first.res };
  const body = await readJson(request, max);
  if (body.error) return { res: json({ ok: false, error: body.error }, body.error === "too_large" ? 413 : 400) };
  const data = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : null;
  if (!data) return { res: json({ ok: false, error: "invalid" }, 400) };

  return assistAccess(request, data, { owner });
}

export async function assistAccess(request, data, { owner = false } = {}) {
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

export async function afterChange({ ctx, team, business }, assistant, action, details = {}) {
  if (assistant && assistant.public_id) forgetAssistant(assistant.public_id);
  if (team) await logAction(ctx, action, business.name, details);
}
