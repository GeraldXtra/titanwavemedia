import { guard } from "@/lib/api";
import { eventText } from "@/lib/events";
import { lagosClock, lagosShort, lagosToday } from "@/lib/format";
import { json, readJson } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Icons for the bell, by kind.
const ICONS = {
  invoice_new: "card",
  payment_ok: "check",
  payment_failed: "close",
  payment_in: "bank",
  payment_review: "card",
  double_payment: "card",
  autopay_failed: "card",
  refund_received: "card",
  refund_done: "card",
  refund_declined: "card",
  new_refund: "card",
  refund_failed: "card",
  file_team: "upload",
  file_client: "upload",
  new_project: "folder",
  quote_sent: "folder",
  quote_accepted: "folder",
  quote_changes: "folder",
  step_changed: "folder",
  assist_handover: "users",
};

function when(iso) {
  const day = new Date(iso).toISOString();
  return lagosToday(0) === lagosToday(0, new Date(day)) ? lagosClock(new Date(iso)) : lagosShort(iso);
}

// The bell's items for the view the person is in, and the counts for the side menu. The
// console asks every 15 seconds.
export async function GET(request) {
  const { ctx, res } = await guard(request, { write: false });
  if (res) return res;
  const mode = new URL(request.url).searchParams.get("mode") === "team" ? "team" : "client";
  if (mode === "team" && !ctx.isTeam) return json({ ok: false, error: "forbidden" }, 403);
  const admin = getAdmin();

  const [list, unread, due, inbox] = await Promise.all([
    admin.from("notifications").select("id, kind, data, link, created_at, read_at").eq("user_id", ctx.user.id).eq("audience", mode).order("created_at", { ascending: false }).limit(30),
    admin.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", ctx.user.id).eq("audience", mode).is("read_at", null),
    ctx.business ? admin.from("invoices").select("id", { count: "exact", head: true }).eq("business_id", ctx.business.id).eq("status", "due") : { count: 0 },
    ctx.isTeam ? admin.from("threads").select("id", { count: "exact", head: true }).eq("status", "new") : { count: 0 },
  ]);

  const items = (list.data || []).map((n) => ({
    id: n.id,
    text: eventText(mode, n.kind, n.data),
    link: n.link,
    when: when(n.created_at),
    read: Boolean(n.read_at),
    icon: ICONS[n.kind] || (mode === "team" ? "inbox" : "chat"),
  }));
  return json({ ok: true, items, unread: unread.count || 0, counts: { due: due.count || 0, inbox: inbox.count || 0 } });
}

// Marks bell items as read: a list of ids, or "all".
export async function POST(request) {
  const { ctx, res } = await guard(request);
  if (res) return res;
  const body = await readJson(request, 4 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const mode = data.mode === "team" ? "team" : "client";
  let q = getAdmin().from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", ctx.user.id).eq("audience", mode).is("read_at", null);
  if (data.ids !== "all") {
    const ids = (Array.isArray(data.ids) ? data.ids : []).map(Number).filter(Number.isInteger).slice(0, 100);
    if (!ids.length) return json({ ok: true });
    q = q.in("id", ids);
  }
  await q;
  return json({ ok: true });
}
