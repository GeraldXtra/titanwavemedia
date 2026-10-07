import about from "@/content/about";
import Hero from "@/components/Hero";
import Founder from "@/components/Founder";
import Rich from "@/components/Rich";
import { DaysSince } from "@/components/Live";
import { BlkHead, Cards, Cta, Section, Subnav } from "@/components/Blocks";
import { daysSince } from "@/lib/lagos";
import { pageMeta } from "@/lib/seo";
import { ph } from "@/lib/text";

export const metadata = pageMeta({ ...about.meta, path: "/about" });

export default function AboutPage() {
  const { hero, founder, what, details, timeline } = about;
  return (
    <main className="page" id="main-about">
      <Hero home title={hero.title} text={hero.text} />
      <Subnav links={about.subnav} />

      <Section tone="white" id="about-founder">
        <Founder copy={founder} />
      </Section>

      <Section tone="grey" id="about-what">
        <BlkHead title={what.title} />
        <Cards n={2} cards={what.cards} />
      </Section>

      <Section tone="white" id="about-details">
        <BlkHead title={details.title} text={details.text} />
        <dl className="details">
          {details.items.map((d, i) => (
            <div key={i}>
              <dt>{d.label}</dt>
              <dd>
                <Rich text={d.value} />
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="grey" id="about-timeline">
        <BlkHead title={timeline.title} />
        <ol className="timeline">
          {timeline.items.map((t, i) => (
            <li key={i}>
              {t.date ? (
                <time className={ph(t.date)} dateTime={t.datetime}>
                  {t.date}
                </time>
              ) : (
                <span />
              )}
              <div>
                <h3 className={ph(t.title)}>{t.title}</h3>
                <p className={ph(t.text)}>
                  {t.since ? (
                    <Rich text={t.text} tokens={{ days: <DaysSince date={t.since} initial={daysSince(t.since)} /> }} />
                  ) : (
                    t.text
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Cta />
    </main>
  );
}
