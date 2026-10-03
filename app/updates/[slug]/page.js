import Link from "next/link";
import { notFound } from "next/navigation";
import post from "@/content/post";
import updates from "@/content/updates";
import Hero from "@/components/Hero";
import Rich from "@/components/Rich";
import CopyLinkButton from "@/components/CopyLinkButton";
import { Cta, PostList, Section, Strip } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { format, ph } from "@/lib/text";

// One page per entry in content/post.js. Other addresses get the "Page not found" page.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(post.pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = post.pages[slug];
  if (!p) return {};
  return pageMeta({ ...p.meta, path: `/updates/${slug}`, index: p.published });
}

// About 200 words a minute, counted over everything in the article.
function readingMinutes(p, back) {
  const text = [p.opening, ...p.body.map((b) => b.image || b.heading || b.paragraph), back].join(" ");
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const p = post.pages[slug];
  if (!p) notFound();
  const l = post.labels;
  const others = updates.items.filter((i) => i.slug !== slug);
  const more = (others.length ? others : updates.items).slice(0, 2);
  return (
    <main className="page" id="main-updates-post">
      <Hero title={p.title} crumbs={[{ label: l.crumb, href: "/updates" }, { label: p.title }]}>
        <p className="hero__text">
          <Rich text={format(l.byline, { date: p.date, author: p.author })} />
        </p>
      </Hero>

      <Section tone="white">
        <article className="article box">
          <p className={ph(p.opening)} style={{ marginTop: 0, fontSize: "1.25rem", color: "var(--ink)" }}>
            {p.opening}
          </p>
          {p.body.map((b, i) => {
            if (b.image) return <div className="ph-box" key={i}>{b.image}</div>;
            if (b.heading) return <h2 className={ph(b.heading)} key={i}>{b.heading}</h2>;
            return <p className={ph(b.paragraph)} key={i}>{b.paragraph}</p>;
          })}
          <p style={{ marginTop: 32 }}>
            <Link className="link" href={l.back.href}>
              {l.back.label}
            </Link>
          </p>
        </article>
        <Strip icon="code" text={<span data-readtime="">{format(l.readTime, { minutes: readingMinutes(p, l.back.label) })}</span>} style={{ marginTop: "var(--gap)" }}>
          <CopyLinkButton label={l.copy} done={l.copied} prompt={l.copyPrompt} />
        </Strip>
        <div style={{ marginTop: "var(--gap)" }}>
          <h2 style={{ fontSize: "1.6rem", marginBottom: 12 }}>{l.more}</h2>
          <PostList items={more} />
        </div>
      </Section>

      <Cta />
    </main>
  );
}
