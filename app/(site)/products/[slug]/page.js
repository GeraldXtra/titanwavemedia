import { notFound } from "next/navigation";
import product from "@/content/product";
import productList, { priceOf } from "@/content/product-list";
import Hero from "@/components/Hero";
import Btn from "@/components/Btn";
import CopyLinkButton from "@/components/CopyLinkButton";
import { BlkHead, Cta, Faq, Gap, Notify, OutLink, Section, StatusTag, Strip } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { format } from "@/lib/text";

// One page for each product in content/product-list.js. Other addresses get the "Page not found" page.
export const dynamicParams = false;

const find = (slug) => productList.items.find((p) => p.slug === slug);

export function generateStaticParams() {
  return productList.items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = find(slug);
  if (!p) return {};
  return pageMeta({ title: format(product.meta.title, { name: p.name }), description: p.text, path: `/products/${slug}` });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = find(slug);
  if (!p) notFound();
  const l = product.labels;
  const values = { name: p.name, slug: p.slug };
  // The product's own questions first, then the ones every product with its status shares.
  const faq = [...(p.faq || []), ...(product.faq[p.status] || [])];
  return (
    <main className="page" id="main-products-product">
      <Hero title={p.name} text={p.text} crumbs={[{ label: l.crumb, href: "/products" }, { label: p.name }]}>
        <div className="buy">
          <StatusTag status={p.status} />
          <strong>{priceOf(p)}</strong>
          {p.status === "live" && p.url ? (
            <OutLink href={p.url} label={format(l.open, values)} className="btn btn--solid" />
          ) : p.status === "available" ? (
            <Btn href={format(l.talk.href, values)} label={l.talk.label} style="solid" />
          ) : (
            <>
              <a className="btn btn--line" href="#pt-notify" data-jump="">
                <span>{l.notify}</span>
              </a>
              <Btn href={format(l.ask.href, values)} label={l.ask.label} style="line" />
            </>
          )}
        </div>
      </Hero>

      <Section tone="white">
        {p.list.length > 0 && (
          <div className="story">
            <h2>{l.features}</h2>
            <ul className="feats">
              {p.list.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}
        {/* A live product runs on its own website; the others run with us. */}
        {p.status === "available" && (
          <Gap>
            <Strip icon="shield" text={l.privacy.text} link={l.privacy.link} />
          </Gap>
        )}
        <Strip icon="code" text={l.share} style={{ marginTop: "var(--gap)" }}>
          <CopyLinkButton label={l.copy} done={l.copied} prompt={l.copyPrompt} />
        </Strip>
      </Section>

      {(faq.length > 0 || p.status === "soon") && (
        <Section tone="white">
          {faq.length > 0 && (
            <>
              <BlkHead title={l.questions} />
              <Faq items={faq} />
            </>
          )}
          {p.status === "soon" && (
            <div id="pt-notify" style={{ marginTop: "var(--gap)", scrollMarginTop: 110 }}>
              <Notify title={format(l.notifyTitle, values)} thanks={l.thanks} inputId="pt-email" source={`product:${slug}`} />
            </div>
          )}
        </Section>
      )}

      <Cta />
    </main>
  );
}
