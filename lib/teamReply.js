import "server-only";
import { getAdmin } from "./supabase";
import { businessPeople, notifyBusiness } from "./events";
import { sendEmail } from "./mail";
import { siteUrl } from "./seo";
import emails from "@/content/console/emails";

export async function teamReplyEffects(thread, ctx, text) {
  const who = ((ctx.profile.full_name || "").trim() || emails.team).split(/\s+/)[0];
  const admin = getAdmin();
  const first = (name) => String(name || "").trim().split(/\s+/)[0] || undefined;

  if (thread.kind === "project") {
    const { data: project } = await admin.from("projects").select("id, title, business_id").eq("id", thread.project_id).maybeSingle();
    if (!project) return;
    const link = `/console/projects/${project.id}`;
    await notifyBusiness(project.business_id, "reply_project", { who, project: project.title }, link);
    for (const p of (await businessPeople(project.business_id)).filter((x) => x.profile.notify_projects !== false)) {
      try {
        await sendEmail({ to: p.email, key: "project_message", url: `${siteUrl}${link}`, data: { first: first(p.profile.full_name), who, project: project.title, text } });
      } catch (e) {
        console.error("[reply] project email:", e.message);
      }
    }
    return;
  }

  let link = null;
  if (thread.kind === "help") {
    link = `/console/help/${thread.id}`;
    await notifyBusiness(thread.business_id, "reply_help", { subject: thread.subject }, link);
  } else if (thread.kind === "refund") {
    link = `/console/receipts/${thread.subject}`;
    await notifyBusiness(thread.business_id, "reply_refund", { number: thread.subject }, link);
  } else if (thread.kind === "feedback" && thread.business_id) {
    link = "/console";
    await notifyBusiness(thread.business_id, "reply_feedback", {}, link);
  }
  if (!thread.from_email) return;
  try {
    await sendEmail({
      to: thread.from_email,
      key: "reply",
      url: link ? `${siteUrl}${link}` : null,
      noButtonText: emails.templates.reply.noAccount,
      data: { first: first(thread.from_name), who, text },
    });
  } catch (e) {
    console.error("[reply] email:", e.message);
  }
}
