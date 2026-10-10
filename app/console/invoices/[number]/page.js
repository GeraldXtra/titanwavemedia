import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { InvoiceDoc } from "@/components/console/Docs";
import PayWindow from "@/components/console/PayWindow";
import { PrintButton, RemindButton } from "@/components/console/DocActions";
import { paystackTestMode } from "@/lib/accounts";
import { getContext } from "@/lib/auth";
import { cardBadge, cardLabel } from "@/lib/cards";
import { loadInvoice } from "@/lib/docs";
import { naira } from "@/lib/format";
import { settleWaitingFor } from "@/lib/payments";
import { format } from "@/lib/text";
import copy from "@/content/console/invoice";
import billing from "@/content/console/billing";

export async function generateMetadata({ params }) {
  const { number } = await params;
  return { title: `${format(copy.title, { number })}, Titan Wave Media Console` };
}

export default async function InvoicePage({ params, searchParams }) {
  const { number } = await params;
  const sp = await searchParams;
  const ctx = await getContext();
  if (!ctx.user) redirect("/signin");
  let found = await loadInvoice(ctx, number);
  if (!found) notFound();
  const loadCards = () => ctx.supabase.from("saved_cards").select("*").order("created_at");
  const early = found.side === "client" && ctx.role === "owner" && found.inv.status === "due" ? Promise.resolve(loadCards()) : null;
  if (early) early.catch(() => {});
  if (found.inv.status === "due" && (await settleWaitingFor(found.inv.id))) found = await loadInvoice(ctx, number);
  const { inv, lines, receipts, side } = found;
  const client = side === "client";
  const canPay = client && ctx.role === "owner" && inv.status === "due";

  let cards = [];
  if (canPay) {
    const { data } = await (early || loadCards());
    cards = (data || []).map((c) => ({ id: c.id, label: cardLabel(c), brand: cardBadge(c), isDefault: c.is_default }));
  }
  const paidReceipt = receipts.find((r) => r.status !== "refund_requested") || receipts[0];

  return (
    <>
      <div className="c-head noprint">
        <div>
          <p className="c-head__crumb">
            <Link className="link" href={client ? "/console/billing?tab=invoices" : "/console/team/invoices"}>
              {client ? billing.tabs.invoices : copy.crumbTeam}
            </Link>
          </p>
          <h1>{format(copy.title, { number: inv.number })}</h1>
        </div>
        <div className="btns">
          {canPay && (
            <PayWindow
              invoice={{ number: inv.number, title: inv.title, amount: naira(inv.total_kobo) }}
              cards={cards}
              testMode={paystackTestMode()}
              open={sp.pay === "1"}
              label={format(copy.pay, { amount: naira(inv.total_kobo) })}
            />
          )}
          {!client && inv.status === "due" && <RemindButton number={inv.number} solid />}
          {paidReceipt && (
            <Link className="btn" href={`/console/receipts/${paidReceipt.number}`}>
              {copy.receipt}
            </Link>
          )}
          <PrintButton />
        </div>
      </div>
      <InvoiceDoc inv={inv} lines={lines} />
    </>
  );
}
