import Link from "next/link";
import BillingMethods from "@/components/console/BillingMethods";
import PlanCard from "@/components/console/assist/PlanCard";
import { nextInvoiceOn } from "@/lib/assist/console";
import { clientContext } from "@/lib/console";
import { cardBadge, cardExpiry, cardLabel } from "@/lib/cards";
import { lagosDay, lagosParts, naira } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
import { format } from "@/lib/text";
import copy from "@/content/console/billing";

export const metadata = { title: copy.meta.title };

const TABS = ["overview", "invoices", "payments", "methods"];

export default async function BillingPage({ searchParams }) {
  const sp = await searchParams;
  const tab = TABS.includes(sp.tab) ? sp.tab : "overview";
  const ctx = await clientContext();
  const db = ctx.supabase;
  const owner = ctx.role === "owner";

  const [invoices, payments, projects, cards, assist] = await Promise.all([
    db.from("invoices").select("id, number, title, due_on, total_kobo, status, issued_at").order("issued_at", { ascending: false }),
    db.from("payments").select("reference, invoice_id, method, channel, card_type, card_last4, amount_kobo, refunded_kobo, status, paid_at, created_at, failure_reason").order("created_at", { ascending: false }),
    db.from("projects").select("id, title, care_kobo, care_started_on, care_next_on, care_ended_on").gt("care_kobo", 0).not("care_started_on", "is", null),
    owner ? db.from("saved_cards").select("*").order("created_at") : { data: [] },
    db.from("assistants").select("monthly_limit, plan_kobo, billing_on, billing_next_on").eq("business_id", ctx.business.id).maybeSingle(),
  ]);
  const plan = assist.data && (assist.data.plan_kobo || assist.data.billing_on) ? assist.data : null;
  const inv = invoices.data || [];
  const byId = new Map(inv.map((i) => [i.id, i]));
  const { data: receipts } = await db.from("receipts").select("number, payment_id, payments(reference)");
  const receiptFor = new Map((receipts || []).map((r) => [r.payments && r.payments.reference, r.number]));
  const due = inv.filter((i) => i.status === "due").sort((a, b) => String(a.due_on).localeCompare(String(b.due_on)));
  const dueTotal = due.reduce((a, i) => a + Number(i.total_kobo), 0);
  const year = lagosParts().year;
  const paidThisYear = (payments.data || []).filter((p) => p.status === "success" && p.paid_at && lagosParts(p.paid_at).year === year);
  const paidTotal = paidThisYear.reduce((a, p) => a + Number(p.amount_kobo) - Number(p.refunded_kobo || 0), 0);
  const care = (projects.data || []).filter((p) => !p.care_ended_on);
  const nextCare = care.filter((p) => p.care_next_on).sort((a, b) => a.care_next_on.localeCompare(b.care_next_on))[0];
  const cardList = (cards.data || []).map((c) => ({ id: c.id, label: cardLabel(c), brand: cardBadge(c), expiry: cardExpiry(c), isDefault: c.is_default }));
  const defaultCard = cardList.find((c) => c.isDefault);
  const autopay = Boolean(ctx.business.autopay);
  const o = copy.overview;

  let panel = null;
  if (tab === "overview") {
    panel = (
      <>
        <div className="c-stats" style={{ "--n": 3 }}>
          <div className={`c-stat${due.length ? " c-stat--strong" : ""}`}>
            <small>{o.toPay}</small>
            <b>{naira(dueTotal)}</b>
            <span>{due.length === 0 ? o.toPayNone : format(due.length === 1 ? o.toPayOne : o.toPayMany, { count: due.length, date: lagosDay(due[0].due_on) })}</span>
            {due.length > 0 && owner && (
              <Link className="btn btn--solid btn--sm" href={`/console/invoices/${due[0].number}?pay=1`}>
                {o.pay}
              </Link>
            )}
          </div>
          <div className="c-stat">
            <small>{o.next}</small>
            <b>{nextCare ? naira(nextCare.care_kobo) : naira(0)}</b>
            <span>
              {nextCare
                ? autopay && defaultCard
                  ? format(o.nextAuto, { date: lagosDay(nextCare.care_next_on), card: defaultCard.label })
                  : format(o.nextInvoice, { date: lagosDay(nextCare.care_next_on) })
                : o.nextNone}
            </span>
          </div>
          <div className="c-stat">
            <small>{o.paid}</small>
            <b>{naira(paidTotal)}</b>
            <span>{paidThisYear.length === 0 ? o.paidNone : paidThisYear.length === 1 ? o.paidOne : format(o.paidCount, { count: paidThisYear.length })}</span>
          </div>
        </div>
        <section className="c-sec c-card">
          <h2>{o.plans}</h2>
          <p className="note">{o.plansHelp}</p>
          {care.length ? (
            <div className="c-tw" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th>{o.plansProject}</th>
                    <th>{o.plansSince}</th>
                    <th className="num">{o.plansMonthly}</th>
                  </tr>
                </thead>
                <tbody>
                  {care.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link className="link" href={`/console/projects/${p.id}`}>
                          {p.title}
                        </Link>
                      </td>
                      <td>{lagosDay(p.care_started_on)}</td>
                      <td className="num">{naira(p.care_kobo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ marginTop: 8 }}>{o.plansNone}</p>
          )}
        </section>
        {plan && (
          <div className="c-sec">
            <PlanCard assistant={plan} nextOn={nextInvoiceOn(plan)} title={o.assist} help={o.assistHelp} />
          </div>
        )}
      </>
    );
  }

  if (tab === "invoices") {
    const t = copy.invoices;
    const show = ["due", "paid"].includes(sp.show) ? sp.show : "all";
    const list = inv.filter((i) => show === "all" || (show === "paid" ? i.status === "paid" || i.status === "refunded" : i.status === "due"));
    panel = (
      <>
        <div className="c-row" style={{ marginBottom: 12 }}>
          <nav className="c-filter" aria-label={t.filter}>
            {["all", "due", "paid"].map((k) => (
              <Link key={k} href={`/console/billing?tab=invoices${k === "all" ? "" : `&show=${k}`}`} aria-current={show === k ? "page" : undefined}>
                {t[k]}
              </Link>
            ))}
          </nav>
          <span className="note">{due.length ? format(t.summary, { count: due.length, total: naira(dueTotal) }) : t.summaryNone}</span>
        </div>
        {list.length ? (
          <div className="c-tw">
            <table>
              <thead>
                <tr>
                  <th>{t.number}</th>
                  <th>{t.for}</th>
                  <th>{t.dueOn}</th>
                  <th className="num">{t.amount}</th>
                  <th>{t.status}</th>
                  <th>
                    <span className="sr-only">{copy.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <Link className="link" href={`/console/invoices/${i.number}`}>
                        {i.number}
                      </Link>
                    </td>
                    <td>{i.title}</td>
                    <td>{lagosDay(i.due_on)}</td>
                    <td className="num">{naira(i.total_kobo)}</td>
                    <td>
                      <span className={`c-chip${i.status === "paid" ? " c-chip--ok" : ""}`}>{copy.invoiceStatus[i.status]}</span>
                    </td>
                    <td>
                      <span className="btns">
                        {i.status === "due" && owner && (
                          <Link className="btn btn--sm" href={`/console/invoices/${i.number}?pay=1`}>
                            {t.pay}
                          </Link>
                        )}
                        <Link className="btn btn--sm" href={`/console/invoices/${i.number}`} aria-label={`${t.view} ${i.number}`}>
                          {t.view}
                        </Link>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="c-empty">
            <p>{inv.length ? t.empty : t.emptyAll}</p>
          </div>
        )}
      </>
    );
  }

  if (tab === "payments") {
    const t = copy.payments;
    const show = ["success", "failed"].includes(sp.show) ? sp.show : "all";
    const list = (payments.data || []).filter((p) => (show === "all" ? ["success", "failed", "review"].includes(p.status) : p.status === show));
    panel = (
      <>
        <div className="c-row" style={{ marginBottom: 12 }}>
          <nav className="c-filter" aria-label={t.filter}>
            {["all", "success", "failed"].map((k) => (
              <Link key={k} href={`/console/billing?tab=payments${k === "all" ? "" : `&show=${k}`}`} aria-current={show === k ? "page" : undefined}>
                {t[k]}
              </Link>
            ))}
          </nav>
          <span className="note">{t.note}</span>
        </div>
        {list.length ? (
          <div className="c-tw">
            <table>
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.for}</th>
                  <th>{t.with}</th>
                  <th className="num">{t.amount}</th>
                  <th>{t.status}</th>
                  <th>
                    <span className="sr-only">{copy.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const i = byId.get(p.invoice_id) || {};
                  const r = receiptFor.get(p.reference);
                  return (
                    <tr key={p.reference}>
                      <td>{lagosDay(p.paid_at || p.created_at)}</td>
                      <td>{i.title || i.number}</td>
                      <td>{methodLabel(p)}</td>
                      <td className="num">{naira(p.amount_kobo)}</td>
                      <td>
                        <span className={`c-chip${p.status === "success" ? " c-chip--ok" : p.status === "failed" ? " c-chip--danger" : ""}`}>{copy.paymentStatus[p.status]}</span>
                      </td>
                      <td>
                        {r ? (
                          <Link className="btn btn--sm" href={`/console/receipts/${r}`}>
                            {t.receipt}
                          </Link>
                        ) : i.status === "due" && owner ? (
                          <Link className="btn btn--sm" href={`/console/invoices/${i.number}?pay=1`}>
                            {t.tryAgain}
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="c-empty">
            <p>{(payments.data || []).length ? t.empty : t.emptyAll}</p>
          </div>
        )}
      </>
    );
  }

  if (tab === "methods") {
    const m = copy.methods;
    const autoLine = !autopay
      ? cardList.length
        ? m.autoOff
        : m.autoNeedsCard
      : nextCare && defaultCard
        ? format(m.autoOn, { amount: naira(nextCare.care_kobo), card: defaultCard.label, date: lagosDay(nextCare.care_next_on), project: nextCare.title })
        : format(m.autoOnNoCare, { card: defaultCard ? defaultCard.label : "" });
    panel = owner ? <BillingMethods cards={cardList} autopay={autopay} autoLine={autoLine} /> : <p className="c-card">{format(m.ownerOnly, { business: ctx.business.name })}</p>;
  }

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      <nav className="c-tabs" aria-label={copy.title}>
        {TABS.map((t) => (
          <Link key={t} href={t === "overview" ? "/console/billing" : `/console/billing?tab=${t}`} aria-current={t === tab ? "page" : undefined}>
            {copy.tabs[t]}
          </Link>
        ))}
      </nav>
      <div className="c-sec">{panel}</div>
    </>
  );
}
