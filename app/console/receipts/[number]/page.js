import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReceiptDoc } from "@/components/console/Docs";
import { PrintButton, ReceiptActions } from "@/components/console/DocActions";
import { getContext } from "@/lib/auth";
import { loadReceipt } from "@/lib/docs";
import { lagosDay, naira } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
import { format } from "@/lib/text";
import copy from "@/content/console/receipt";

export async function generateMetadata({ params }) {
  const { number } = await params;
  return { title: `${format(copy.title, { number })}, Titan Wave Media Console` };
}

export default async function ReceiptPage({ params }) {
  const { number } = await params;
  const ctx = await getContext();
  if (!ctx.user) redirect("/signin");
  const found = await loadReceipt(ctx, number);
  if (!found) notFound();
  const { r, payment, inv, lines, refund, side } = found;
  const client = side === "client";
  const doc = { ...r, refundAskedOn: refund && r.status === "refund_requested" ? lagosDay(refund.created_at) : null };

  return (
    <>
      <div className="c-head noprint">
        <div>
          <p className="c-head__crumb">
            <Link className="link" href={client ? "/console/billing?tab=payments" : "/console/team/payments"}>
              {client ? copy.crumb : copy.crumbTeam}
            </Link>
          </p>
          <h1>{format(copy.title, { number: r.number })}</h1>
        </div>
        <div className="btns">
          <PrintButton />
          {client && (
            <ReceiptActions
              number={r.number}
              canRefund={ctx.role === "owner" && r.status === "paid"}
              what={format(copy.refund.what, { number: r.number, amount: naira(r.amount_kobo), title: inv.title })}
            />
          )}
        </div>
      </div>
      <ReceiptDoc r={doc} payment={payment} inv={inv} lines={lines} method={methodLabel(payment)} />
    </>
  );
}
