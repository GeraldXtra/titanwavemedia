import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import NotifyToggle from "@/components/console/NotifyToggle";
import { clientContext } from "@/lib/console";
import copy from "@/content/console/products";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = copy.items.find((i) => i.slug === slug);
  return { title: p ? `${p.name}, Titan Wave Media Console` : copy.meta.title };
}

// One coming soon product: what it will do, and Notify me.
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = copy.items.find((i) => i.slug === slug);
  if (!p) notFound();
  const ctx = await clientContext();
  const { data } = await ctx.supabase.from("product_interest").select("product").eq("product", slug);
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
        <span className="c-chip c-chip--grey">{copy.soon}</span>
      </div>
      <div className="c-split">
        <div className="c-card">
          <h2>{copy.whatTitle}</h2>
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
          <h2>{copy.wantTitle}</h2>
          <p style={{ marginTop: 6 }}>{copy.wantText}</p>
          <div className="btns" style={{ marginTop: 14 }}>
            <NotifyToggle slug={p.slug} name={p.name} on={Boolean(data && data.length)} main />
          </div>
        </div>
      </div>
    </>
  );
}
