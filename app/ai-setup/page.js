import aiSetup from "@/content/ai-setup";
import Hero from "@/components/Hero";
import SetupBuilder from "@/components/SetupBuilder";
import { BlkHead, Cards, Cta, ExampleChat, Gap, Section, StepList, Strip, Subnav } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { fill, ph } from "@/lib/text";

export const metadata = pageMeta({ ...aiSetup.meta, path: "/ai-setup" });

export default function AiSetupPage() {
  const { hero, what, build, how, price } = aiSetup;
  return (
    <main className="page" id="main-ai-setup">
      <Hero title={hero.title} text={hero.text} buttons={hero.buttons} />
      <Subnav links={aiSetup.subnav} />

      <Section tone="white" id="setup-what">
        <BlkHead title={what.title} />
        <Cards n={2} cards={what.cards} />
      </Section>

      <Section tone="grey" id="setup-build">
        <BlkHead title={build.title} text={build.text} />
        <SetupBuilder copy={build} />
      </Section>

      <Section tone="grey">
        <div className="sticky" id="setup-how">
          <div className="sticky__vis">
            <div className="box">
              <h2>{how.example.title}</h2>
              <p>{how.example.text}</p>
              <div className="mini" style={{ marginTop: 18 }}>
                <ExampleChat chat={how.example.chat} customer={how.example.customer} assistant={how.example.assistant} />
              </div>
              <p className="note" style={{ marginTop: 12 }}>
                {how.example.note}
              </p>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: "clamp(2rem,1.3rem + 2.4vw,3.6rem)", marginBottom: 20 }}>{how.title}</h2>
            <StepList steps={how.steps} />
          </div>
        </div>
      </Section>

      <Section tone="white" id="setup-price">
        <BlkHead title={price.title} />
        <div className="prices">
          {price.items.map((p, i) => {
            const value = fill(p.price);
            return (
              <div className="price" key={i}>
                <h3>{p.title}</h3>
                <strong className={ph(value)}>{value}</strong>
                <p>{p.text}</p>
              </div>
            );
          })}
        </div>
        <Gap>
          <Strip icon="shield" text={price.strip.text} link={price.strip.link} />
        </Gap>
      </Section>

      <Cta />
    </main>
  );
}
