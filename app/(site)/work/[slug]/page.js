import Link from "next/link";
import { notFound } from "next/navigation";
import project from "@/content/project";
import Hero from "@/components/Hero";
import CopyLinkButton from "@/components/CopyLinkButton";
import { Cta, Section, Strip } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { ph } from "@/lib/text";

// One page per entry in content/project.js. Other addresses get the "Page not found" page.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(project.pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = project.pages[slug];
  if (!p) return {};
  return pageMeta({ ...p.meta, path: `/work/${slug}`, index: p.published });
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const p = project.pages[slug];
  if (!p) notFound();
  const l = project.labels;
  return (
    <main className="page" id="main-work-project">
      <Hero title={p.name} text={p.line} crumbs={[{ label: l.crumb, href: "/work" }, { label: p.name }]} />

      <Section tone="white">
        <div className="meta-bar">
          {p.facts.map((fact, i) => (
            <div key={i}>
              <span>{fact.label}</span>
              <b className={ph(fact.value)}>{fact.value}</b>
            </div>
          ))}
        </div>
        <div className="shot">
          <div className="ph-box">{p.screenshot}</div>
        </div>
      </Section>

      <Section tone="white">
        <div className="stack">
          {p.stories.map((s, i) => (
            <div className="story" key={i}>
              <h2>{s.title}</h2>
              <p className={ph(s.text)}>{s.text}</p>
            </div>
          ))}
          <div className="shot" style={{ margin: 0 }}>
            <div className="ph-box">{p.secondScreenshot}</div>
          </div>
          <Link className="next" href={p.next.href}>
            <div>
              <span>{l.next}</span>
              <b className={ph(p.next.name)}>{p.next.name}</b>
            </div>
          </Link>
          <Strip icon="code" text={l.share}>
            <CopyLinkButton label={l.copy} done={l.copied} prompt={l.copyPrompt} />
          </Strip>
        </div>
      </Section>

      <Cta cta={project.cta} />
    </main>
  );
}
