import Link from "next/link";
import { lagosDay, naira } from "@/lib/format";
import { format } from "@/lib/text";
import copy from "@/content/console/assist";

const p = copy.plan;

export default function PlanCard({ assistant, nextOn, title = p.title, help = null }) {
  const limit = Number(assistant.monthly_limit || 0).toLocaleString("en-NG");
  return (
    <section className="c-card as-plancard" aria-labelledby="as-plancard-h">
      <h2 id="as-plancard-h">{title}</h2>
      {help && <p className="note">{help}</p>}
      <dl className="as-dl">
        <dt>{p.priceLabel}</dt>
        <dd>{assistant.plan_kobo ? format(p.price, { price: naira(assistant.plan_kobo) }) : p.noPrice}</dd>
        <dt>{p.limitLabel}</dt>
        <dd>{format(p.limit, { limit })}</dd>
      </dl>
      <p>{nextOn ? format(p.next, { date: lagosDay(nextOn) }) : p.notBilled}</p>
      <p className="note" style={{ marginTop: 8 }}>
        {p.change}{" "}
        <Link className="link" href={p.talkHref}>
          {p.talk}
        </Link>
      </p>
    </section>
  );
}
