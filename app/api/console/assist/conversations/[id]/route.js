import copy from "@/content/console/assist";
import { afterChange, assistAction, isUuid } from "@/lib/assist/consoleApi";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const action = await assistAction(request, 1024, { owner: true });
  if (action.res) return action.res;
  const { business } = action;
  if (!isUuid(id)) return json({ ok: false, message: copy.notFound }, 404);

  const { data, error } = await getAdmin().from("assist_conversations").delete().eq("id", id).eq("business_id", business.id).select("id");
  if (error) {
    console.error("[assist console] delete:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
  if (!data || !data.length) return json({ ok: false, message: copy.notFound }, 404);
  await afterChange(action, null, "assist_deleted");
  return json({ ok: true, message: copy.conversation.deleted });
}
