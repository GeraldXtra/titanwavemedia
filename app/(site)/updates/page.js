import updates from "@/content/updates";
import Hero from "@/components/Hero";
import Filterable from "@/components/Filterable";
import { Gap, Notify, PostList, Section } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...updates.meta, path: "/updates" });

const cats = new Set(updates.items.map((i) => i.cat));
const options = updates.filters.options.filter((o) => o.value === "all" || cats.has(o.value));

export default function UpdatesPage() {
  return (
    <main className="page" id="main-updates">
      <Hero title={updates.hero.title} text={updates.hero.text} />
      <Section tone="white">
        <h2 className="sr-only">{updates.listTitle}</h2>
        <Filterable name="post" label={updates.filters.label} options={options}>
          <PostList items={updates.items} />
        </Filterable>
        <Gap>
          <Notify title={updates.notify.title} text={updates.notify.text} thanks={updates.notify.thanks} inputId="upd-email" source="updates" />
        </Gap>
      </Section>
    </main>
  );
}
