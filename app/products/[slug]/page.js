import { notFound } from "next/navigation";
import product from "@/content/product";
import Hero from "@/components/Hero";
import Btn from "@/components/Btn";
import CopyLinkButton from "@/components/CopyLinkButton";
import { BlkHead, Cards, Cta, Faq, Gap, Notify, Section, StepList, Strip } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { ph, RV1 } from "@/lib/text";

// One page per entry in content/product.js. Other addresses get the "Page not found" page.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(product.pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = product.pages[slug];
  if (!p) return {};
  return pageMeta({ ...p.meta, path: `/products/${slug}`, index: p.published });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = product.pages[slug];
  if (!p) notFound();
  const l = product.labels;
  return (
    <main className="page" id="main-products-product">
      <Hero title={p.name} text={p.line} crumbs={[{ label: l.crumb, href: "/products" }, { label: p.name }]}>
        <div className="buy">
          <span className="tag tag--red">{p.tag}</span>
          <strong className={ph(p.price)}>{p.price}</strong>
          <a className="btn btn--dark" href="#pt-notify" data-jump="">
            <span>{l.notify}</span>
          </a>
          <Btn href={l.ask.href} label={l.ask.label} style="line" />
        </div>
      </Hero>

      <Section tone="white">
        <div className={`shot ${RV1}`} style={{ marginTop: 0 }}>
          <div className="ph-box">{p.screenshot}</div>
        </div>
      </Section>

      <Section tone="white">
        <BlkHead title={l.features} />
        <Cards n={3} cards={p.features} />
      </Section>

      <Section tone="white">
        <div className="story">
          <h2>{l.who}</h2>
          <p className={ph(p.who)}>{p.who}</p>
        </div>
      </Section>

      <Section tone="white">
        <BlkHead title={l.get} />
        <StepList steps={p.steps} />
        <Gap>
          <Strip icon="shield" text={l.privacy.text} link={l.privacy.link} />
        </Gap>
        <Strip icon="code" text={l.share} style={{ marginTop: "var(--gap)" }}>
          <CopyLinkButton label={l.copy} done={l.copied} prompt={l.copyPrompt} />
        </Strip>
      </Section>

      <Section tone="white">
        <BlkHead title={l.questions} />
        <Faq items={p.faq} />
        <div id="pt-notify" style={{ marginTop: "var(--gap)", scrollMarginTop: 110 }}>
          <Notify title={p.notifyTitle} thanks={l.thanks} inputId="pt-email" source={`product:${slug}`} />
        </div>
      </Section>

      <Cta />
    </main>
  );
}
