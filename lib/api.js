import "server-only";
import { accountsReady } from "./accounts";
import { getContext } from "./auth";
import { json } from "./http";
import { sameOrigin } from "./security";

// The check at the start of every console action. Returns { ctx } when the person may go on,
// or { res } with the answer to send back when they may not.
// - write: the action changes something, so it must come from our own pages (default true).
// - business: they must belong to a business. owner: they must be its owner.
// - team: Titan Wave Media team only. siteOwner: OWNER_EMAIL only.
export async function guard(request, { write = true, business = false, owner = false, team = false, siteOwner = false } = {}) {
  if (write && !sameOrigin(request)) return { res: json({ ok: false, error: "forbidden" }, 403) };
  if (!accountsReady()) return { res: json({ ok: false, error: "off" }, 503) };
  const ctx = await getContext();
  if (!ctx.user) return { res: json({ ok: false, error: "signed_out" }, 401) };
  if (ctx.needsCode) return { res: json({ ok: false, error: "code" }, 403) };
  if ((team && !ctx.isTeam) || (siteOwner && !ctx.isOwner)) return { res: json({ ok: false, error: "forbidden" }, 403) };
  if ((business || owner) && !ctx.business) return { res: json({ ok: false, error: "no_business" }, 403) };
  if (owner && ctx.role !== "owner") return { res: json({ ok: false, error: "owner_only" }, 403) };
  return { ctx };
}
