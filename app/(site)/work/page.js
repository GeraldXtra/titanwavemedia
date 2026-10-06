import work from "@/content/work";
import project from "@/content/project";
import Hero from "@/components/Hero";
import Filterable from "@/components/Filterable";
import { Cta, Section, WorkTiles } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...work.meta, path: "/work" });

export default function WorkPage() {
  const f = work.filters;
  // A filter button for each kind of project that has at least one project in it.
  const options = [
    { value: "all", label: f.all },
    ...Object.entries(project.kinds)
      .filter(([kind]) => work.items.some((item) => item.kind === kind))
      .map(([value, label]) => ({ value, label })),
  ];
  return (
    <main className="page" id="main-work">
      <Hero title={work.hero.title} text={work.hero.text} />
      <Section tone="white">
        <h2 className="sr-only">{work.listTitle}</h2>
        <Filterable
          name="wtile"
          label={f.label}
          options={options}
          searchLabel={f.searchLabel}
          searchPlaceholder={f.searchPlaceholder}
          empty={f.empty}
        >
          <WorkTiles items={work.items} list />
        </Filterable>
      </Section>
      <Cta cta={work.cta} />
    </main>
  );
}
