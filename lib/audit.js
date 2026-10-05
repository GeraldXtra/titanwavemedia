import "server-only";
import { getAdmin } from "./supabase";

// The log of team actions in Team view: invoices sent, refunds approved, steps changed, members
// added and removed. `action` is a short name the Log page has words for (content/console/team-log.js).
export async function logAction(ctx, action, target, details = {}) {
  const { error } = await getAdmin()
    .from("audit_log")
    .insert({ actor_id: ctx.user.id, actor_email: ctx.email, action, target: target ? String(target).slice(0, 200) : null, details });
  if (error) console.error("[audit]", error.message);
}
