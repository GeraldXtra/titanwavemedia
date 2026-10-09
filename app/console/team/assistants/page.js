import Link from "next/link";
import Status from "@/components/console/Status";
import { allRows } from "@/lib/assist/console";
import { PRICES_CHECKED } from "@/lib/assist/prices";
import { monthStart } from "@/lib/assist/store";
import { teamContext } from "@/lib/console";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import copy from "@/content/console/team-assistants";

export const metadata = { title: copy.meta.title };

function dollars(x) {
  const v = Number(x || 0);
  const digits = v > 0 && v < 1 ? 4 : 2;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
}

export default async function TeamAssistantsPage() {
  await teamContext();
  const admin = getAdmin();
  const month = monthStart();
  const [businesses, assistants, usage] = await Promise.all([
    admin.from("businesses").select("id, name, created_at").order("created_at", { ascending: false }),
    admin.from("assistants").select("id, business_id, is_on, sites, monthly_limit"),
    allRows(() => admin.from("assist_usage").select("business_id, cost_usd").gte("created_at", month).order("id"), 200000),
  ]);
  const list = assistants.data || [];
  const counts = await Promise.all(
    list.map((a) =>
      admin
        .from("assist_conversations")
        .select("id", { count: "exact", head: true })
        .eq("assistant_id", a.id)
        .gte("created_at", month)
        .eq("over_limit", false)
        .then((r) => r.count || 0)
    )
  );
  const used = new Map(list.map((a, i) => [a.business_id, counts[i]]));
  const byBusiness = new Map(list.map((a) => [a.business_id, a]));
  const cost = new Map();
  for (const u of usage) cost.set(u.business_id, (cost.get(u.business_id) || 0) + Number(u.cost_usd || 0));
  const total = [...cost.values()].reduce((s, x) => s + x, 0);
  const t = copy.table;
  const rows = (businesses.data || []).map((b) => ({ b, a: byBusiness.get(b.id), used: used.get(b.id) || 0, cost: cost.get(b.id) || 0 }));

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
        <span className="note">{format(copy.total, { cost: dollars(total) })}</span>
      </div>
      {rows.length ? (
        <div className="c-tw">
          <table>
            <thead>
              <tr>
                <th>{t.business}</th>
                <th>{t.status}</th>
                <th>{t.sites}</th>
                <th className="num">{t.month}</th>
                <th className="num">{t.cost}</th>
                <th>
                  <span className="sr-only">{t.open}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ b, a, used: n, cost: c }) => (
                <tr key={b.id}>
                  <td>
                    <b>{b.name}</b>
                  </td>
                  <td>
                    {a ? (
                      <Status kind="assistant" value={a.is_on ? "on" : "off"} label={a.is_on ? copy.status.on : copy.status.off} />
                    ) : (
                      <span className="note">{copy.status.none}</span>
                    )}
                  </td>
                  <td className="as-sitescell">{a && a.sites && a.sites.length ? a.sites.join(", ") : <span className="note">{copy.noSites}</span>}</td>
                  <td className="num">{a ? format(copy.month, { used: n.toLocaleString("en-NG"), limit: Number(a.monthly_limit).toLocaleString("en-NG") }) : <span className="note">{copy.noSites}</span>}</td>
                  <td className="num">{dollars(c)}</td>
                  <td>
                    <Link className="link" href={`/console/team/assistants/${b.id}`} aria-label={format(copy.openLabel, { business: b.name })}>
                      {copy.open}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="c-empty">
          <p>{copy.empty}</p>
        </div>
      )}
      <p className="note" style={{ marginTop: 12 }}>
        {format(copy.costNote, { date: PRICES_CHECKED })}
      </p>
    </>
  );
}
