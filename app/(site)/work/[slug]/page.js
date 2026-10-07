import Link from "next/link";
import { notFound } from "next/navigation";
import project from "@/content/project";
import Hero from "@/components/Hero";
import CopyLinkButton from "@/components/CopyLinkButton";
import { Cta, OutLink, Section, Strip } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { ph } from "@/lib/text";

export const dynamicParams = false;

const published = Object.keys(project.pages).filter((slug) => project.pages[slug].published);

const SIZES = "(max-width: 1440px) 94vw, 1360px";

export function generateStaticParams() {
  return Object.keys(project.pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = project.pages[slug];
  if (!p) return {};
  return pageMeta({ ...p.meta, path: `/work/${slug}`, index: p.published });
}

function Shot({ shot, first }) {
  return (
    <figure className="shot">
      <img
        src={shot.src}
        srcSet={`${shot.small} ${Math.round(shot.width / 2)}w, ${shot.src} ${shot.width}w`}
        sizes={SIZES}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        loading={first ? "eager" : "lazy"}
        decoding="async"
      />
    </figure>
  );
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const p = project.pages[slug];
  if (!p) notFound();
  const l = project.labels;
  const facts = [{ label: l.kind, value: project.kinds[p.kind] }, ...p.facts];
  const shots = p.shots || [];
  const at = published.indexOf(slug);
  const next = published.length > 1 && at >= 0 ? published[(at + 1) % published.length] : null;
  return (
    <main className="page" id="main-work-project">
      <Hero title={p.name} text={p.line} crumbs={[{ label: l.crumb, href: "/work" }, { label: p.name }]}>
        {p.links && p.links.length > 0 && (
          <div className="btns">
            {p.links.map((link, i) => (
              <OutLink key={i} href={link.href} label={link.label} className={i === 0 ? "btn btn--solid" : "btn btn--line"} />
            ))}
          </div>
        )}
      </Hero>

      <Section tone="white">
        <div className="meta-bar">
          {facts.map((fact, i) => (
            <div key={i}>
              <span>{fact.label}</span>
              <b className={ph(fact.value)}>{fact.value}</b>
            </div>
          ))}
        </div>
        {shots[0] && <Shot shot={shots[0]} first />}
      </Section>

      <Section tone="white">
        <div className="stack">
          {p.stories.map((s, i) => (
            <div className="story" key={i}>
              <h2>{s.title}</h2>
              <div className="story__text">
                {[].concat(s.text).map((text, j) => (
                  <p className={ph(text)} key={j}>
                    {text}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {shots.slice(1).map((shot, i) => (
            <Shot shot={shot} key={i} />
          ))}
          {next && (
            <Link className="next" href={`/work/${next}`}>
              <div>
                <span>{l.next}</span>
                <b>{project.pages[next].name}</b>
              </div>
            </Link>
          )}
          <Strip icon="code" text={l.share}>
            <CopyLinkButton label={l.copy} done={l.copied} prompt={l.copyPrompt} />
          </Strip>
        </div>
      </Section>

      <Cta cta={project.cta} />
    </main>
  );
}
