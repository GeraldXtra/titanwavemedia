import copy from "@/content/console/settings";
import { ownerEmail } from "@/lib/accounts";
import { guard } from "@/lib/api";
import { forgetAssistant } from "@/lib/assist/store";
import { json, readJson, str } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";
import { likeExact } from "@/lib/text";

export const runtime = "nodejs";

// Deletes the account (an owner only, and not while an invoice is unpaid): the business, its
// people's accounts and personal data, its projects, files and messages. Invoices, payments,
// receipts and refunds are kept for the tax records, with the business taken off them.
export async function DELETE(request) {
  const { ctx, res } = await guard(request, { owner: true });
  if (res) return res;
  const body = await readJson(request, 1024);
  const biz = ctx.business;
  if (str(body.data && body.data.confirm).trim() !== biz.name) return json({ ok: false, message: copy.data.confirmWrong }, 400);

  const admin = getAdmin();
  const { count: unpaid } = await admin.from("invoices").select("id", { count: "exact", head: true }).eq("business_id", biz.id).eq("status", "due");
  if (unpaid) return json({ ok: false, message: copy.data.unpaid }, 409);

  const { data: members } = await admin.from("business_members").select("user_id, email").eq("business_id", biz.id);
  const { data: team } = await admin.from("team_members").select("email");
  const teamEmails = new Set([...(team || []).map((t) => t.email), ownerEmail()]);

  // Files in the private bucket.
  const { data: files } = await admin.from("project_files").select("path").eq("business_id", biz.id);
  const paths = (files || []).map((f) => f.path);
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await admin.storage.from("project-files").remove(paths.slice(i, i + 100));
    if (error) console.error("[account] files:", error.message);
  }

  // Messages these people sent through the website, and the notify list.
  for (const m of members || []) {
    await admin.from("messages").delete().ilike("email", likeExact(m.email));
    await admin.from("threads").delete().eq("from_email", m.email).is("business_id", null);
    await admin.from("notify_list").delete().ilike("email", likeExact(m.email));
  }

  // The business and everything in it, its Wave Assist too. Money rows stay, without the business.
  const { data: assistant } = await admin.from("assistants").select("public_id").eq("business_id", biz.id).maybeSingle();
  const { error } = await admin.from("businesses").delete().eq("id", biz.id);
  if (error) {
    console.error("[account] business:", error.message);
    return json({ ok: false, message: copy.failed }, 502);
  }
  // Its chat stops at once on this server, instead of when the cached setup runs out.
  if (assistant) forgetAssistant(assistant.public_id);

  // The people's own accounts. Someone on our team keeps their account.
  for (const m of members || []) {
    if (!m.user_id || teamEmails.has(m.email)) continue;
    const { error: userError } = await admin.auth.admin.deleteUser(m.user_id);
    if (userError) console.error("[account] user:", userError.message);
  }
  return json({ ok: true });
}
