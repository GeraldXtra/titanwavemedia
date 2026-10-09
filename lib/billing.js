import "server-only";
import { getAdmin } from "./supabase";
import { addActivity, businessPeople, notifyBusiness } from "./events";
import { lagosDay, lagosToday, naira } from "./format";
import { sendEmail } from "./mail";
import { siteUrl } from "./seo";
import { format } from "./text";
import billing from "@/content/console/billing";

export async function issueInvoice({ businessId, projectId = null, kind = "custom", title, dueOn, note = null, lines, periodStart = null, periodEnd = null, createdBy = null }) {
  const admin = getAdmin();
  const { data: before } =
    kind === "assist"
      ? await admin.from("invoices").select("id").eq("business_id", businessId).eq("kind", "assist").eq("period_start", periodStart).maybeSingle()
      : projectId && kind !== "custom"
        ? await admin.from("invoices").select("id").eq("project_id", projectId).eq("kind", kind).match(kind === "care" ? { period_start: periodStart } : {}).maybeSingle()
        : { data: null };
  const { data: inv, error } = await admin.rpc("create_invoice", {
    p_business_id: businessId,
    p_project_id: projectId,
    p_kind: kind,
    p_title: title,
    p_due_on: dueOn,
    p_note: note,
    p_lines: lines,
    p_period_start: periodStart,
    p_period_end: periodEnd,
    p_created_by: createdBy,
  });
  if (error) throw new Error(`invoice: ${error.message}`);
  if (before) return { invoice: inv, isNew: false };

  await addActivity(businessId, createdBy, "invoice_new", { number: inv.number, amount_kobo: inv.total_kobo });
  await notifyBusiness(businessId, "invoice_new", { number: inv.number, amount_kobo: inv.total_kobo }, `/console/invoices/${inv.number}`);
  if (projectId) await admin.from("project_updates").insert({ project_id: projectId, business_id: businessId, kind: "invoice", data: { number: inv.number, amount_kobo: inv.total_kobo }, created_by: createdBy });
  await emailInvoice(inv, "invoice");
  return { invoice: inv, isNew: true };
}

export async function invoiceEmailDetails(inv) {
  const { data } = await getAdmin().from("invoice_lines").select("description, amount_kobo, position").eq("invoice_id", inv.id).order("position");
  return {
    issued: lagosDay(inv.issued_at),
    billed: inv.billed_business || inv.billed_name || "",
    lines: (data || []).map((l) => ({ what: l.description, amount: naira(l.amount_kobo) })),
    total: naira(inv.total_kobo),
  };
}

export async function emailInvoice(inv, which = "invoice", subject = "subject") {
  if (!inv.business_id) return 0;
  const people = (await businessPeople(inv.business_id, { ownersOnly: true })).filter((p) => p.profile.notify_billing !== false);
  const details = which === "invoice" ? await invoiceEmailDetails(inv) : {};
  let sent = 0;
  for (const p of people) {
    try {
      await sendEmail({
        to: p.email,
        key: which,
        subject,
        url: `${siteUrl}/console/invoices/${inv.number}`,
        data: {
          first: (p.profile.full_name || "").split(/\s+/)[0] || undefined,
          number: inv.number,
          title: inv.title,
          amount: naira(inv.total_kobo),
          due: lagosDay(inv.due_on),
          ...details,
        },
      });
      sent++;
    } catch (e) {
      console.error("[billing] email:", e.message);
    }
  }
  return sent;
}

export async function firstHalfInvoice(project, setupKobo, userId) {
  const first = Math.floor(Number(setupKobo) / 2);
  return issueInvoice({
    businessId: project.business_id,
    projectId: project.id,
    kind: "setup_first",
    title: format(billing.titles.setupFirst, { project: project.title }),
    dueOn: lagosToday(7),
    lines: [{ description: format(billing.lines.setupFirst, { project: project.title, setup: naira(setupKobo) }), quantity: 1, unit_kobo: first }],
    createdBy: userId,
  });
}

export async function secondHalfInvoice(project, userId) {
  const total = Number(project.setup_kobo || 0);
  const second = total - Math.floor(total / 2);
  if (second <= 0) return null;
  return issueInvoice({
    businessId: project.business_id,
    projectId: project.id,
    kind: "setup_second",
    title: format(billing.titles.setupSecond, { project: project.title }),
    dueOn: lagosToday(7),
    lines: [{ description: format(billing.lines.setupSecond, { project: project.title, setup: naira(total) }), quantity: 1, unit_kobo: second }],
    createdBy: userId,
  });
}
