import work from "@/content/work";
import Hero from "@/components/Hero";
import Filterable from "@/components/Filterable";
import { Cta, Section, WorkTiles } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...work.meta, path: "/work" });

export default function WorkPage() {
  const f = work.filters;
  return (
    <main className="page" id="main-work">
      <Hero title={work.hero.title} text={work.hero.text} />
      <Section tone="white">
        <h2 className="sr-only">{work.listTitle}</h2>
        <Filterable name="wtile" label={f.label} options={f.options} searchLabel={f.searchLabel} searchPlaceholder={f.searchPlaceholder}>
          <WorkTiles items={work.items} list />
        </Filterable>
      </Section>
      <Cta cta={work.cta} />
    </main>
  );
}
