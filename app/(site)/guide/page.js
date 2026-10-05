import guide from "@/content/guide";
import Hero from "@/components/Hero";
import Btn from "@/components/Btn";
import GuideShot from "@/components/GuideShot";
import { Section, Subnav } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { format } from "@/lib/text";

export const metadata = pageMeta({ ...guide.meta, path: "/guide" });

export default function GuidePage() {
  const { hero, sections } = guide;
  let shotCount = 0;
  return (
    <main className="page" id="main-guide">
      <Hero title={hero.title} text={hero.text} />
      <Subnav links={sections.map((s) => ({ id: `guide-${s.id}`, label: s.name }))} />

      {sections.map((s, i) => (
        <Section tone={i % 2 ? "grey" : "white"} id={`guide-${s.id}`} key={s.id}>
          <div className="guide__head">
            <h2>{s.name}</h2>
            <p>{s.purpose}</p>
          </div>
          {s.shots.map((shot) => {
            const first = shotCount === 0;
            shotCount += 1;
            return <GuideShot key={shot.src} shot={shot} id={`g${shotCount}`} eager={first} />;
          })}
          <div className="btns guide__go">
            {s.links.map((l) => (
              <Btn key={l.href} href={l.href} label={format(guide.go, { page: l.page })} style="line" />
            ))}
          </div>
        </Section>
      ))}

      <Section tone={sections.length % 2 ? "grey" : "white"}>
        <p className="guide__end">{guide.end}</p>
      </Section>
    </main>
  );
}
