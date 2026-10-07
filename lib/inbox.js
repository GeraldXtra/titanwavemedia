import "server-only";
import { getAdmin } from "./supabase";
import { naira } from "./format";
import { format } from "./text";
import { loadMessages, shapeMessages, when } from "./threads";
import copy from "@/content/console/team-inbox";

export async function listInbox(filter = "all") {
  const admin = getAdmin();
  let q = admin.from("threads").select("id, kind, status, subject, from_name, from_email, business_id, last_message_at, businesses(name)").order("last_message_at", { ascending: false }).limit(100);
  if (filter === "new") q = q.eq("status", "new");
  if (filter === "replied") q = q.neq("status", "new");
  const { data: threads } = await q;
  const list = threads || [];
  const ids = list.map((t) => t.id);
  const { data: msgs } = ids.length ? await admin.from("thread_messages").select("thread_id, body, created_at").in("thread_id", ids).order("created_at", { ascending: false }).limit(500) : { data: [] };
  const last = new Map();
  for (const m of msgs || []) if (!last.has(m.thread_id)) last.set(m.thread_id, m.body);
  return list.map((t) => ({
    id: t.id,
    kind: t.kind,
    status: t.status,
    who: (t.businesses && t.businesses.name) || t.from_name || t.from_email || "",
    label: format(copy.kinds[t.kind] || "", { subject: t.subject || "" }),
    last: (last.get(t.id) || "").slice(0, 160),
    when: when(t.last_message_at),
  }));
}

export async function threadDetail(id, ctx) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id || ""))) return null;
  const admin = getAdmin();
  const { data: t } = await admin.from("threads").select("*, businesses(name)").eq("id", id).maybeSingle();
  if (!t) return null;
  const d = copy.details;
  const det = t.details || {};
  const details = [];
  if (t.businesses) details.push([d.business, t.businesses.name]);
  if (det.need) details.push([d.need, copy.needs[det.need] || det.need]);
  if (det.channel) details.push([d.channel, det.channel]);
  if (det.rows) details.push([d.rows, det.rows]);
  if (det.product) details.push([d.product, det.product]);
  if (det.where) details.push([d.where, det.where]);
  if (det.receipt) details.push([d.receipt, det.receipt]);
  if (det.amount_kobo) details.push([d.amount, naira(det.amount_kobo)]);
  if (det.reason) details.push([d.reason, det.reason]);
  if (det.page) details.push([d.page, det.page]);
  if (t.from_email) details.push([d.email, t.from_email]);

  let refund = null;
  if (t.kind === "refund" && t.refund_id) {
    const { data: rr } = await admin.from("refund_requests").select("id, status, amount_kobo").eq("id", t.refund_id).maybeSingle();
    if (rr) refund = { id: rr.id, status: rr.status, amount: naira(rr.amount_kobo) };
  }
  const messages = shapeMessages(await loadMessages(t.id), { viewer: "team", userId: ctx.user.id, you: copy.reply.you });
  return {
    id: t.id,
    kind: t.kind,
    status: t.status,
    who: (t.businesses && t.businesses.name) || t.from_name || t.from_email || "",
    label: format(copy.kinds[t.kind] || "", { subject: t.subject || "" }),
    business: t.businesses ? t.businesses.name : "",
    projectId: t.project_id,
    details,
    refund,
    messages,
  };
}
