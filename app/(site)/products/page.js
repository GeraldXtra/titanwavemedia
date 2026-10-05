import products from "@/content/products";
import Hero from "@/components/Hero";
import Filterable from "@/components/Filterable";
import { Gap, Notify, ProductRow, Section, Strip } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...products.meta, path: "/products" });

export default function ProductsPage() {
  const f = products.filters;
  return (
    <main className="page" id="main-products">
      <Hero title={products.hero.title} text={products.hero.text} />
      <Section tone="white">
        <h2 className="sr-only">{products.listTitle}</h2>
        <Filterable
          name="pcard"
          label={f.label}
          options={f.options}
          searchLabel={f.searchLabel}
          searchPlaceholder={f.searchPlaceholder}
          empty={f.empty}
        >
          <ProductRow items={products.items} list />
        </Filterable>
        <Gap>
          <Notify title={products.notify.title} text={products.notify.text} thanks={products.notify.thanks} inputId="prod-email" source="products" />
        </Gap>
        <Gap>
          <Strip icon="tool" text={products.strip.text} button={products.strip.button} />
        </Gap>
      </Section>
    </main>
  );
}
