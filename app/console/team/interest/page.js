import { teamContext } from "@/lib/console";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import copy from "@/content/console/team-interest";
import products from "@/content/console/products";

export const metadata = { title: copy.meta.title };

// How many people asked to hear about each product: the console's Notify me plus the website's
// notify list from that product's page.
export default async function TeamInterestPage() {
  await teamContext();
  const admin = getAdmin();
  const [{ data: consoleRows }, { data: siteRows }] = await Promise.all([
    admin.from("product_interest").select("product"),
    admin.from("notify_list").select("source"),
  ]);
  const rows = products.items
    .map((p) => {
      const inConsole = (consoleRows || []).filter((r) => r.product === p.slug).length;
      const onSite = (siteRows || []).filter((r) => r.source === `product:${p.slug}`).length;
      return { name: p.name, inConsole, onSite, total: inConsole + onSite };
    })
    .sort((a, b) => b.total - a.total);
  const general = (siteRows || []).filter((r) => !String(r.source || "").startsWith("product:")).length;
  const total = rows.reduce((a, r) => a + r.total, 0);
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
        {total > 0 && (
          <span className="note">
            {format(copy.total, { total })} {format(copy.top, { name: rows[0].name })}
          </span>
        )}
      </div>
      <div className="c-card">
        {total === 0 && <p style={{ marginBottom: 14 }}>{copy.empty}</p>}
        <ul className="c-bars">
          {rows.map((r) => (
            <li key={r.name}>
              <span>{r.name}</span>
              <span className="c-bar" role="img" aria-label={`${r.name}: ${format(copy.people, { count: r.total })}. ${copy.console} ${r.inConsole}, ${copy.website} ${r.onSite}.`}>
                <i style={{ width: `${Math.round((r.total / max) * 100)}%` }} />
              </span>
              <span>{r.total}</span>
            </li>
          ))}
        </ul>
        <p className="note" style={{ marginTop: 14 }}>
          {copy.note} {format(copy.general, { count: general })}
        </p>
      </div>
    </>
  );
}
