import Link from "next/link";
import privacy from "@/content/privacy";
import Hero from "@/components/Hero";
import Btn from "@/components/Btn";
import Icon from "@/components/Icon";
import PrivacyDemo from "@/components/PrivacyDemo";
import { BlkHead, Section, Subnav } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...privacy.meta, path: "/privacy" });

export default function PrivacyPage() {
  const { hero, promises, demo, tools } = privacy;
  return (
    <main className="page" id="main-privacy">
      <Hero title={hero.title} text={hero.text} />

      <Section tone="white" id="priv-promises">
        <BlkHead title={promises.title} />
        <div className="promises" style={{ "--n": 2 }}>
          {promises.items.map((p, i) => (
            <div className="promise" key={i}>
              <Icon name={p.icon} />
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Subnav links={privacy.subnav} />

      <Section tone="grey" id="priv-demo">
        <PrivacyDemo copy={demo} />
      </Section>

      <Section tone="white" id="priv-tools">
        <div className="notify">
          <div>
            <h3>{tools.title}</h3>
            <p>{tools.text}</p>
          </div>
          <div className="btns">
            <Btn href={tools.button.href} label={tools.button.label} style="line" />
          </div>
        </div>
        <p style={{ marginTop: 22 }}>
          <Link className="link" href={tools.policyLink.href}>
            {tools.policyLink.label}
          </Link>
        </p>
      </Section>
    </main>
  );
}
