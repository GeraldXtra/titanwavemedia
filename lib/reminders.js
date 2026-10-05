import "server-only";
import { getAdmin } from "./supabase";
import { emailInvoice } from "./billing";
import { notifyBusiness } from "./events";
import { daysUntil, lagosDay } from "./format";

// A reminder about an unpaid invoice: by email to the people who pay, and in their bell.
// The subject follows the due date: before it, on the day, or after it.
export async function remind(inv) {
  const left = daysUntil(inv.due_on);
  const subject = left > 0 ? "subject" : left === 0 ? "subjectToday" : "subjectLate";
  const sent = await emailInvoice(inv, "reminder", subject);
  await notifyBusiness(inv.business_id, "invoice_reminder", { number: inv.number, amount_kobo: inv.total_kobo, date: lagosDay(inv.due_on) }, `/console/invoices/${inv.number}`);
  await getAdmin().from("invoices").update({ last_reminder_at: new Date().toISOString() }).eq("id", inv.id);
  return sent;
}
