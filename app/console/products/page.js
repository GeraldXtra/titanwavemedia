import Link from "next/link";
import Icon from "@/components/Icon";
import NotifyToggle from "@/components/console/NotifyToggle";
import { clientContext } from "@/lib/console";
import copy from "@/content/console/products";

export const metadata = { title: copy.meta.title };

// Every product, each coming soon with Notify me.
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
        {copy.items.map((p) => (
          <div className="c-tile" key={p.slug}>
            <Icon name={p.icon} />
            <div className="c-row">
              <h2 style={{ fontSize: 17 }}>
                <Link className="link" href={`/console/products/${p.slug}`}>
                  {p.name}
                </Link>
              </h2>
              <span className="c-chip c-chip--grey">{copy.soon}</span>
            </div>
            <p>{p.text}</p>
            <div className="c-tile__foot">
              <NotifyToggle slug={p.slug} name={p.name} on={mine.has(p.slug)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
