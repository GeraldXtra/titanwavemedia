import thankYou from "@/content/thank-you";
import Hero from "@/components/Hero";
import SentSummary from "@/components/SentSummary";
import FollowLine from "@/components/FollowLine";
import { accountsReady } from "@/lib/accounts";
import { Section } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({ ...thankYou.meta, path: "/thank-you", index: false });

export default function ThankYouPage() {
  const { hero, sent, bought, follow } = thankYou;
  return (
    <main className="page" id="main-thank-you">
      <Hero home title={hero.title} text={hero.text} buttons={hero.buttons} />
      <Section tone="white">
        {accountsReady() && <FollowLine text={follow.text} link={follow.link} />}
        <div className="split">
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
