import thankYou from "@/content/thank-you";
import Hero from "@/components/Hero";
import SentSummary from "@/components/SentSummary";
import { Section } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { RV } from "@/lib/text";

// Only reached after sending the form, so it stays out of search results.
export const metadata = pageMeta({ ...thankYou.meta, path: "/thank-you", index: false });

export default function ThankYouPage() {
  const { hero, sent, bought } = thankYou;
  return (
    <main className="page" id="main-thank-you">
      <Hero home title={hero.title} text={hero.text} buttons={hero.buttons} />
      <Section tone="white">
        <div className={`split ${RV}`}>
          <SentSummary title={sent.title} />
          <div className="box">
            <h2>{bought.title}</h2>
            <p>{bought.text}</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
