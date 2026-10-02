import syntheticData from "@/content/synthetic-data";
import Hero from "@/components/Hero";
import DatasetBuilder from "@/components/DatasetBuilder";
import { BlkHead, Cards, Cta, Section, StepList, Subnav } from "@/components/Blocks";
import { datasetRow } from "@/lib/fakeData";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...syntheticData.meta, path: "/synthetic-data" });

export default function SyntheticDataPage() {
  const { hero, who, build, how } = syntheticData;
  // A first table for the first paint; the browser makes fresh rows straight away.
  const cols = build.fields.filter((f) => f.checked).map((f) => f.value);
  const count = Number((build.rows.find((r) => r.checked) || build.rows[0]).value);
  const initial = { cols, rows: Array.from({ length: count }, () => datasetRow(cols)) };
  return (
    <main className="page" id="main-synthetic-data">
      <Hero title={hero.title} text={hero.text} buttons={hero.buttons} />

      <Section tone="white" id="data-who">
        <BlkHead title={who.title} />
        <Cards n={3} cards={who.cards} />
      </Section>

      <Subnav links={syntheticData.subnav} />

      <Section tone="grey" id="data-build">
        <BlkHead title={build.title} text={build.text} />
        <DatasetBuilder copy={build} initial={initial} />
      </Section>

      <Section tone="white" id="data-how">
        <BlkHead title={how.title} />
        <StepList steps={how.steps} />
      </Section>

      <Cta cta={syntheticData.cta} />
    </main>
  );
}
