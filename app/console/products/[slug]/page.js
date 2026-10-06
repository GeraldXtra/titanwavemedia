import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import NotifyToggle from "@/components/console/NotifyToggle";
import { clientContext } from "@/lib/console";
import { format } from "@/lib/text";
import copy, { priceOf } from "@/content/console/products";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = copy.items.find((i) => i.slug === slug);
  return { title: p ? `${p.name}, Titan Wave Media Console` : copy.meta.title };
}

// One product: what it does (or will do), and how to use it. A live product opens on its own
// website, one that works in the console opens its console page, and one on the way has
// Notify me.
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = copy.items.find((i) => i.slug === slug);
  if (!p) notFound();
  const ctx = await clientContext();
  const soon = p.status === "soon";
  const page = copy.pages[p.slug];
  const price = p.status === "available" ? "" : priceOf(p);
  const { data } = soon ? await ctx.supabase.from("product_interest").select("product").eq("product", slug) : { data: [] };
  const openLabel = format(copy.openProduct, { name: p.name });
  return (
    <>
      <div className="c-head">
        <div>
          <p className="c-head__crumb">
            <Link className="link" href="/console/products">
              {copy.back}
            </Link>
          </p>
          <div className="c-head__title">
            <Icon name={p.icon} />
            <h1>{p.name}</h1>
          </div>
          <p className="c-lede">{p.text}</p>
        </div>
        <span className={soon ? "c-chip c-chip--grey" : "c-chip c-chip--ok"}>{copy.status[p.status]}</span>
      </div>
      <div className="c-split">
        <div className="c-card">
          <h2>{soon ? copy.whatTitle : copy.whatLive}</h2>
          <ul className="c-list" style={{ marginTop: 12 }}>
            {p.list.map((item) => (
              <li key={item}>
                <Icon name="check" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="c-card">
          <h2>{soon ? copy.wantTitle : copy.useTitle}</h2>
          {price && <p style={{ marginTop: 6, fontWeight: 700, color: "var(--ink)" }}>{price}</p>}
          <p style={{ marginTop: 6 }}>{soon ? copy.wantText : format(page ? copy.useHere : copy.useLive, { name: p.name })}</p>
          <div className="btns" style={{ marginTop: 14 }}>
            {soon && <NotifyToggle slug={p.slug} name={p.name} on={Boolean(data && data.length)} main />}
            {!soon && page && (
              <Link className="btn btn--solid" href={page}>
                {openLabel}
              </Link>
            )}
            {!soon && !page && p.url && (
              <a className="btn btn--solid" href={p.url} target="_blank" rel="noopener noreferrer">
                {openLabel}
                <span className="sr-only"> {copy.newTab}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
