import Link from "next/link";
import Icon from "@/components/Icon";
import { RemindButton } from "@/components/console/DocActions";
import Status from "@/components/console/Status";
import { paystackTestMode } from "@/lib/accounts";
import { teamContext } from "@/lib/console";
import { lagosDay, lagosParts, naira } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
import { settlements } from "@/lib/paystack";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import copy from "@/content/console/team-payments";

export const metadata = { title: copy.meta.title };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function TeamPaymentsPage() {
  await teamContext();
  const admin = getAdmin();
  const [payments, due, settled] = await Promise.all([
    admin.from("payments").select("*, invoices(number, title, billed_business, total_kobo), receipts(number)").in("status", ["success", "review"]).order("paid_at", { ascending: false }).limit(200),
    admin.from("invoices").select("number, billed_business, business_id, due_on, total_kobo, last_reminder_at").eq("status", "due").not("business_id", "is", null).order("due_on"),
    settlements({ perPage: 30 }),
  ]);
  const list = payments.data || [];
  const now = lagosParts();
  const month = list
    .filter((p) => p.status === "success" && p.paid_at && (() => { const d = lagosParts(p.paid_at); return d.year === now.year && d.month === now.month; })())
    .reduce((a, p) => a + Number(p.amount_kobo) - Number(p.refunded_kobo || 0), 0);
  const owed = (due.data || []).reduce((a, i) => a + Number(i.total_kobo), 0);
  const payouts = settled.ok && Array.isArray(settled.data) ? settled.data : null;
  const outKobo = payouts ? payouts.filter((s) => s.status === "success").reduce((a, s) => a + Number(s.total_amount || 0), 0) : null;
  const wayKobo = payouts ? payouts.filter((s) => s.status === "pending" || s.status === "processing").reduce((a, s) => a + Number(s.total_amount || 0), 0) : null;
  const k = copy.kpis;
  const count = (due.data || []).length;

  const paidCount = new Map();
  list.filter((p) => p.status === "success").forEach((p) => paidCount.set(p.invoice_id, (paidCount.get(p.invoice_id) || 0) + 1));
  const attention = [
    ...list.filter((p) => p.status === "review").map((p) => format(copy.attention.review, { number: p.invoices.number, received: naira(p.received_kobo || 0), amount: naira(p.invoices.total_kobo) })),
    ...[...paidCount].filter(([, n]) => n > 1).map(([id]) => format(copy.attention.double, { number: list.find((p) => p.invoice_id === id).invoices.number })),
  ];
  const r = copy.received;

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
        <div className="btns">
          <Link className="btn btn--solid" href="/console/team/invoices">
            <Icon name="plus" />
            {copy.newInvoice}
          </Link>
        </div>
      </div>
      {paystackTestMode() && (
        <p className="c-test" style={{ marginBottom: 12, border: "1px solid var(--line-soft)" }}>
          {copy.test}
        </p>
      )}
      <div className="c-stats">
        <div className="c-stat c-stat--strong">
          <small>{k.month}</small>
          <b>{naira(month)}</b>
          <span>{format(k.monthSub, { month: `${MONTHS[now.month - 1]} ${now.year}` })}</span>
        </div>
        <div className="c-stat">
          <small>{k.owed}</small>
          <b>{naira(owed)}</b>
          <span>{count === 0 ? k.owedNone : count === 1 ? k.owedOne : format(k.owedSub, { count })}</span>
        </div>
        <div className="c-stat">
          <small>{k.out}</small>
          <b>{outKobo === null ? "" : naira(outKobo)}</b>
          <span>{outKobo === null ? k.unknown : k.outSub}</span>
        </div>
        <div className="c-stat">
          <small>{k.way}</small>
          <b>{wayKobo === null ? "" : naira(wayKobo)}</b>
          <span>{wayKobo === null ? k.unknown : k.waySub}</span>
        </div>
      </div>

      {attention.length > 0 && (
        <section className="c-sec c-card c-card--accent">
          <h2>{copy.attention.title}</h2>
          <ul className="c-list" style={{ marginTop: 10 }}>
            {attention.map((a) => (
              <li key={a}>
                <Icon name="card" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="c-sec">
        <div className="c-sec__head">
          <h2>{r.title}</h2>
          <span className="note">{r.note}</span>
        </div>
        {list.length ? (
          <div className="c-tw">
            <table>
              <thead>
                <tr>
                  <th>{r.date}</th>
                  <th>{r.client}</th>
                  <th>{r.for}</th>
                  <th>{r.with}</th>
                  <th className="num">{r.amount}</th>
                  <th className="num">{r.fee}</th>
                  <th className="num">{r.you}</th>
                  <th>
                    <span className="sr-only">{r.receipt}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const fee = p.fees_kobo == null ? null : Number(p.fees_kobo);
                  const rcp = Array.isArray(p.receipts) ? p.receipts[0] : p.receipts;
                  return (
                    <tr key={p.reference}>
                      <td>{lagosDay(p.paid_at || p.created_at)}</td>
                      <td>
                        <b>{p.invoices.billed_business}</b>
                      </td>
                      <td>{p.invoices.title}</td>
                      <td>{methodLabel(p)}</td>
                      <td className="num">{naira(p.amount_kobo)}</td>
                      <td className="num">{fee === null ? <span className="note">{r.none}</span> : naira(fee)}</td>
                      <td className="num">{naira(Number(p.amount_kobo) - (fee || 0) - Number(p.refunded_kobo || 0))}</td>
                      <td>
                        {rcp && (
                          <Link className="btn btn--sm" href={`/console/receipts/${rcp.number}`}>
                            {r.receipt}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="c-empty">
            <p>{r.empty}</p>
          </div>
        )}
      </section>

      <div className="c-split c-sec">
        <div className="c-card">
          <h2>{copy.payouts.title}</h2>
          <p className="note">{copy.payouts.note}</p>
          {payouts === null ? (
            <p style={{ marginTop: 10 }}>{copy.payouts.failed}</p>
          ) : payouts.length ? (
            <div className="c-tw" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th>{copy.payouts.date}</th>
                    <th className="num">{copy.payouts.amount}</th>
                    <th>{copy.payouts.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((s) => (
                    <tr key={s.id}>
                      <td>{lagosDay(s.settlement_date || s.createdAt)}</td>
                      <td className="num">{naira(s.total_amount)}</td>
                      <td>
                        <Status kind="payout" value={s.status} label={copy.payouts.states[s.status] || s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ marginTop: 10 }}>{copy.payouts.empty}</p>
          )}
        </div>
        <div className="c-card">
          <h2>{copy.waiting.title}</h2>
          {due.data && due.data.length ? (
            <ul className="c-list" style={{ marginTop: 12 }}>
              {due.data.map((i) => (
                <li key={i.number}>
                  <Icon name="read" />
                  <span>
                    <b>{i.billed_business}</b>, {naira(i.total_kobo)}
                    <br />
                    <span className="note">
                      {format(copy.waiting.due, { number: i.number, date: lagosDay(i.due_on) })}
                      {i.last_reminder_at ? `. ${format(copy.waiting.reminded, { date: lagosDay(i.last_reminder_at) })}` : ""}
                    </span>
                  </span>
                  <span className="btns" style={{ marginLeft: "auto" }}>
                    <Link className="btn btn--sm" href={`/console/invoices/${i.number}`} aria-label={`${copy.waiting.view} ${i.number}`}>
                      {copy.waiting.view}
                    </Link>
                    <RemindButton number={i.number} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ marginTop: 10 }}>{copy.waiting.empty}</p>
          )}
        </div>
      </div>
    </>
  );
}
