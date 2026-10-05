import "server-only";
import { getAdmin } from "./supabase";

// An invoice or a receipt for its page: a client sees their own (through row level security);
// our team sees any. Returns { ...rows, side } or null.
export async function loadInvoice(ctx, number) {
  if (!/^INV-\d{4,}$/.test(String(number))) return null;
  let side = "client";
  let { data: inv } = await ctx.supabase.from("invoices").select("*").eq("number", number).maybeSingle();
  if (!inv && ctx.isTeam) {
    ({ data: inv } = await getAdmin().from("invoices").select("*").eq("number", number).maybeSingle());
    side = "team";
  }
  if (!inv) return null;
  const db = side === "team" ? getAdmin() : ctx.supabase;
  const [{ data: lines }, { data: receipts }] = await Promise.all([
    db.from("invoice_lines").select("*").eq("invoice_id", inv.id).order("position"),
    db.from("receipts").select("number, status").eq("invoice_id", inv.id).order("created_at"),
  ]);
  return { inv, lines: lines || [], receipts: receipts || [], side };
}

export async function loadReceipt(ctx, number) {
  if (!/^RCP-\d{4,}$/.test(String(number))) return null;
  let side = "client";
  let { data: r } = await ctx.supabase.from("receipts").select("*").eq("number", number).maybeSingle();
  if (!r && ctx.isTeam) {
    ({ data: r } = await getAdmin().from("receipts").select("*").eq("number", number).maybeSingle());
    side = "team";
  }
  if (!r) return null;
  const db = side === "team" ? getAdmin() : ctx.supabase;
  const [{ data: payment }, { data: inv }, { data: lines }, { data: refund }] = await Promise.all([
    db.from("payments").select("*").eq("id", r.payment_id).single(),
    db.from("invoices").select("*").eq("id", r.invoice_id).single(),
    db.from("invoice_lines").select("*").eq("invoice_id", r.invoice_id).order("position"),
    db.from("refund_requests").select("created_at, status").eq("receipt_id", r.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return { r, payment, inv, lines: lines || [], refund, side };
}
