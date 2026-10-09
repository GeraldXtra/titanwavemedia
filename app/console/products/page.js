import Link from "next/link";
import Icon from "@/components/Icon";
import NotifyToggle from "@/components/console/NotifyToggle";
import Status from "@/components/console/Status";
import { clientContext } from "@/lib/console";
import { format } from "@/lib/text";
import copy, { priceOf } from "@/content/console/products";

export const metadata = { title: copy.meta.title };

export default async function ProductsPage() {
  const ctx = await clientContext();
  const { data } = await ctx.supabase.from("product_interest").select("product");
  const mine = new Set((data || []).map((r) => r.product));
  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      <div className="c-grid">
        {copy.items.map((p) => {
          const page = copy.pages[p.slug];
          const price = p.status === "available" ? "" : priceOf(p);
          return (
            <div className="c-tile" key={p.slug}>
              <Icon name={p.icon} />
              <div className="c-row">
                <h2 style={{ fontSize: 17 }}>
                  <Link className="link" href={`/console/products/${p.slug}`}>
                    {p.name}
                  </Link>
                </h2>
                <Status kind="product" value={p.status} label={copy.status[p.status]} />
              </div>
              <p>{p.text}</p>
              <div className="c-tile__foot">
                {price ? <span>{price}</span> : <span />}
                {p.status === "soon" && <NotifyToggle slug={p.slug} name={p.name} on={mine.has(p.slug)} />}
                {p.status !== "soon" && page && (
                  <Link className="btn btn--sm" href={page}>
                    {format(copy.openProduct, { name: p.name })}
                  </Link>
                )}
                {p.status !== "soon" && !page && p.url && (
                  <a className="btn btn--sm" href={p.url} target="_blank" rel="noopener noreferrer">
                    {format(copy.openProduct, { name: p.name })}
                    <span className="sr-only"> {copy.newTab}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
