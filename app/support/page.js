import Link from "next/link";
import support from "@/content/support";
import site from "@/content/site";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import Btn from "@/components/Btn";
import Email from "@/components/Email";
import Rich from "@/components/Rich";
import WorkingLine from "@/components/WorkingLine";
import { BlkHead, Faq, Section } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { emailHref, fill } from "@/lib/text";

export const metadata = pageMeta({ ...support.meta, path: "/support" });

// One way to reach us: WhatsApp (the main button here), email or the contact form.
function ReachCard({ card }) {
  const b = card.button;
  return (
    <div className="card reach">
      <Icon name={card.icon} />
      <h3>{card.title}</h3>
      {card.value && <p className="reach__value">{card.value === "{email}" ? <Email address={site.email} /> : fill(card.value)}</p>}
      <p>{card.text}</p>
      <div className="btns reach__btn">
        {b.whatsapp && (
          <a className="btn btn--solid" href={`${site.whatsappUrl}?text=${encodeURIComponent(b.whatsapp)}`} target="_blank" rel="noopener">
            <Icon name="wa" className={null} />
            <span>{b.label}</span>
          </a>
        )}
        {b.email && (
          <a className="btn btn--line" href={emailHref(site.email)}>
            <Icon name="mail" className={null} />
            <span>{b.label}</span>
          </a>
        )}
        {b.href && <Btn href={b.href} label={b.label} style="line" />}
      </div>
    </div>
  );
}

// A short block of help: a heading, its words and, when there is one, a link.
function HelpBox({ item }) {
  return (
    <div className="box">
      <h2>{item.title}</h2>
      <p>
        <Rich text={item.text} />
      </p>
      {item.link && (
        <p>
          <Link className="link" href={item.link.href}>
            {item.link.label}
          </Link>
        </p>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { hero, reach, hours, faster, urgent, refunds, data, guide, faq } = support;
  return (
    <main className="page" id="main-support">
      <Hero title={hero.title} text={hero.text}>
        <WorkingLine copy={hero} className="hero__live" id="support-live" />
      </Hero>

      <Section tone="white" id="support-reach">
        <BlkHead title={reach.title} />
        <div className="cards" style={{ "--n": 3 }}>
          {reach.cards.map((card) => (
            <ReachCard key={card.title} card={card} />
          ))}
        </div>
      </Section>

      <Section tone="grey" id="support-hours">
        <div className="split">
          <div className="box">
            <h2>{hours.title}</h2>
            {hours.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <HelpBox item={faster} />
        </div>
      </Section>

      <Section tone="white" id="support-more">
        <div className="help-grid">
          <HelpBox item={urgent} />
          <HelpBox item={refunds} />
          <HelpBox item={data} />
          <HelpBox item={guide} />
        </div>
      </Section>

      <Section tone="grey" id="support-faq">
        <BlkHead title={faq.title} />
        <Faq items={faq.items} />
      </Section>
    </main>
  );
}
