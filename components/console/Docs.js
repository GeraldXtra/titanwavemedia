import BrandMark from "../BrandMark";
import { lagosDay, naira } from "@/lib/format";
import { fill, format } from "@/lib/text";
import invoiceCopy from "@/content/console/invoice";
import receiptCopy from "@/content/console/receipt";
import billing from "@/content/console/billing";

// Invoices and receipts, as documents: the same on screen, on paper and as a PDF.

function Company() {
  return (
    <div>
      <div className="c-doc__brand">
        <BrandMark />
        {invoiceCopy.company[0]}
      </div>
      <p className="c-doc__co">
        {invoiceCopy.company.slice(1).map((line, i) => (
          <span key={i}>
            {fill(line)}
            <br />
          </span>
        ))}
      </p>
    </div>
  );
}

function BilledTo({ inv, label }) {
  return (
    <div>
      <small>{label}</small>
      {inv.billed_name && <b>{inv.billed_name}</b>}
      <span>{inv.billed_business}</span>
      {inv.billed_email && <span>{inv.billed_email}</span>}
      {inv.billed_address && <span style={{ whiteSpace: "pre-wrap" }}>{inv.billed_address}</span>}
    </div>
  );
}

function Lines({ lines }) {
  const l = invoiceCopy.doc.lines;
  return (
    <div className="c-tw" style={{ border: 0 }}>
      <table>
        <thead>
          <tr>
            <th>{l.what}</th>
            <th className="num">{l.qty}</th>
            <th className="num">{l.price}</th>
            <th className="num">{l.amount}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td>{line.description}</td>
              <td className="num">{line.quantity}</td>
              <td className="num">{naira(line.unit_kobo)}</td>
              <td className="num">{naira(line.amount_kobo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// `inv`: an invoice row, or a draft with the same fields. `lines`: its lines.
export function InvoiceDoc({ inv, lines, mini = false }) {
  const d = invoiceCopy.doc;
  const stamp = inv.status === "paid" ? d.stampPaid : inv.status === "refunded" ? d.stampRefunded : inv.status === "due" ? d.stampDue : null;
  const total = lines.reduce((a, l) => a + Number(l.amount_kobo || 0), 0);
  return (
    <article className={`c-doc${mini ? " c-doc--mini" : ""}`}>
      <div className="c-doc__head">
        <Company />
        <div className="c-doc__kind">
          <h2>{d.kind}</h2>
          <p>{inv.number}</p>
          {stamp && !mini && <span className={`c-stamp${inv.status === "due" ? " c-stamp--due" : ""}`}>{stamp}</span>}
        </div>
      </div>
      <div className="c-doc__meta">
        <BilledTo inv={inv} label={d.billedTo} />
        <div>
          <small>{d.issued}</small>
          <b>{lagosDay(inv.issued_at)}</b>
          <small>{d.due}</small>
          <b>{inv.due_on ? lagosDay(inv.due_on) : d.dueNow}</b>
        </div>
        <div>
          <small>{d.status}</small>
          <b>{billing.invoiceStatus[inv.status] || ""}</b>
          {inv.paid_at && <span>{format(d.paidOn, { date: lagosDay(inv.paid_at) })}</span>}
        </div>
      </div>
      <Lines lines={lines} />
      <div className="c-doc__total">
        <div>
          <span>{d.subtotal}</span>
          <span>{naira(total)}</span>
        </div>
        <div className="big">
          <span>{d.total}</span>
          <span>{naira(total)}</span>
        </div>
      </div>
      <p className="c-doc__foot">
        <b>{d.howTitle}</b> {d.how}
        <br />
        {fill(d.questions)}
        {inv.note && (
          <>
            <br />
            <b>{d.note}</b> {inv.note}
          </>
        )}
      </p>
    </article>
  );
}

// `r`: a receipt row; `payment`, `inv` and `lines` belong to it. `method`: how it was paid.
export function ReceiptDoc({ r, payment, inv, lines, method }) {
  const d = receiptCopy.doc;
  return (
    <article className="c-doc">
      <div className="c-doc__head">
        <Company />
        <div className="c-doc__kind">
          <h2>{d.kind}</h2>
          <p>{r.number}</p>
          <span className="c-stamp">{r.status === "refunded" ? d.stampRefunded : d.stampPaid}</span>
        </div>
      </div>
      <div className="c-doc__meta">
        <BilledTo inv={inv} label={d.from} />
        <div>
          <small>{d.paidOn}</small>
          <b>{lagosDay(r.paid_at)}</b>
          <small>{d.paidWith}</small>
          <b>{method}</b>
        </div>
        <div>
          <small>{d.reference}</small>
          <b>{payment.reference}</b>
          <small>{d.forInvoice}</small>
          <b>{inv.number}</b>
        </div>
      </div>
      <Lines lines={lines} />
      <div className="c-doc__total">
        {Number(payment.refunded_kobo) > 0 && (
          <div>
            <span>{d.refunded}</span>
            <span>{naira(payment.refunded_kobo)}</span>
          </div>
        )}
        <div className="big">
          <span>{d.amount}</span>
          <span>{naira(r.amount_kobo)}</span>
        </div>
      </div>
      <p className="c-doc__foot">
        {d.foot}
        {r.status === "refund_requested" && r.refundAskedOn && (
          <>
            <br />
            <b>{format(d.refundAsked, { date: r.refundAskedOn })}</b>
          </>
        )}
        {r.status === "refunded" && r.refunded_at && (
          <>
            <br />
            <b>{format(d.refundDone, { date: lagosDay(r.refunded_at), amount: naira(payment.refunded_kobo) })}</b>
          </>
        )}
      </p>
    </article>
  );
}

