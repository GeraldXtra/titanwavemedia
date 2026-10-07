import Link from "next/link";
import { notFound } from "next/navigation";
import post from "@/content/post";
import updates from "@/content/updates";
import site from "@/content/site";
import Hero from "@/components/Hero";
import Btn from "@/components/Btn";
import Rich from "@/components/Rich";
import CopyLinkButton from "@/components/CopyLinkButton";
import { Cta, PostList, Section, Strip } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { format, isExternal, ph } from "@/lib/text";

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

function readingMinutes(p, back) {
  const text = [p.opening, ...p.body.map((b) => b.heading || b.paragraph || ""), back].join(" ");
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

const SIZES = "(max-width: 760px) calc(100vw - 32px), 680px";

function PostImage({ image, first }) {
  return (
    <figure className="shot post__shot">
      <img
        src={image.src}
        srcSet={`${image.small} ${Math.round(image.width / 2)}w, ${image.src} ${image.width}w`}
        sizes={SIZES}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading={first ? "eager" : "lazy"}
        decoding="async"
      />
    </figure>
  );
}

function PostLinks({ links }) {
  return (
    <div className="btns post__links">
      {links.map((l) => (
        <Btn
          key={l.href}
          href={l.href}
          style="line"
          plain
          label={
            <>
              {l.label}
              {isExternal(l.href) && <span className="sr-only"> ({site.newTab})</span>}
            </>
          }
        />
      ))}
    </div>
  );
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
            if (b.image) return <PostImage key={i} image={b.image} first={i === 0} />;
            if (b.links) return <PostLinks key={i} links={b.links} />;
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
