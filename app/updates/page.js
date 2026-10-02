import updates from "@/content/updates";
import Hero from "@/components/Hero";
import Filterable from "@/components/Filterable";
import { Gap, Notify, PostList, Section } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...updates.meta, path: "/updates" });

export default function UpdatesPage() {
  return (
    <main className="page" id="main-updates">
      <Hero title={updates.hero.title} text={updates.hero.text} />
      <Section tone="white">
        <Filterable name="post" label={updates.filters.label} options={updates.filters.options}>
          <PostList items={updates.items} />
        </Filterable>
        <Gap>
          <Notify title={updates.notify.title} text={updates.notify.text} thanks={updates.notify.thanks} inputId="upd-email" source="updates" />
        </Gap>
      </Section>
    </main>
  );
}
