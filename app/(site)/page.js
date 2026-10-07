import home from "@/content/home";
import productList from "@/content/product-list";
import work from "@/content/work";
import updates from "@/content/updates";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import Btn from "@/components/Btn";
import Wave from "@/components/Wave";
import Bento from "@/components/home/Bento";
import Picker from "@/components/home/Picker";
import StepsRow from "@/components/home/StepsRow";
import { BlkHead, Cta, Faq, Gap, Notify, PostList, ProductRow, Section, Strip, WorkTiles } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";
import { format } from "@/lib/text";

export const metadata = pageMeta({
  title: home.meta.title,
  description: home.meta.description,
  shareText: home.meta.shareText,
  path: "/",
});

function productRows() {
  const ready = productList.items.filter((p) => p.status !== "soon");
  const soon = productList.items.length - ready.length;
  const rows = ready.map((p) => ({ name: p.name, tag: productList.status[p.status], status: p.status }));
  if (soon) rows.push({ name: format(home.whatWeDo.products.more, { n: soon }), tag: productList.status.soon, status: "soon" });
  return rows;
}

export default function HomePage() {
  const w = home.whatWeDo;
  return (
    <main className="page" id="main-home">
      <Hero home title={home.hero.title} text={home.hero.text} buttons={home.hero.buttons} />

      <Section tone="grey">
        <BlkHead title={w.title} text={w.text} />
        <Bento copy={w} productRows={productRows()} />
      </Section>

      <Section tone="white" id="who">
        <BlkHead title={home.who.title} text={home.who.text} />
        <Picker copy={home.who} />
      </Section>

      <Section tone="grey">
        <BlkHead title={home.how.title} link={home.how.link} />
        <StepsRow copy={home.how} />
      </Section>

      <Section tone="white">
        <BlkHead title={home.tools.title} link={home.tools.link} />
        <ProductRow items={productList.items.slice(0, 3)} />
        <Gap>
          <Notify title={home.tools.notify.title} thanks={home.tools.notify.thanks} inputId="home-email" source="home" />
        </Gap>
      </Section>

      <Section tone="black">
        <div className="split">
          <div className="box">
            <h2>{home.dataBlock.title}</h2>
            <p>{home.dataBlock.text}</p>
            <div className="btns" style={{ marginTop: 22 }}>
              {home.dataBlock.buttons.map((b, i) => (
                <Btn key={i} href={b.href} label={b.label} style={b.style} />
              ))}
            </div>
          </div>
          <div className="wavebox">
            <Wave kind="small" />
          </div>
        </div>
      </Section>

      <Section tone="grey">
        <BlkHead title={home.privacy.title} link={home.privacy.link} />
        <div className="promises" style={{ "--n": 3 }}>
          {home.privacy.promises.map((p, i) => (
            <details className="promise" key={i}>
              <summary>
                <Icon name={p.icon} />
                <p>{p.text}</p>
              </summary>
              <div className="promise__more">{p.more}</div>
            </details>
          ))}
        </div>
        <Gap>
          <Strip icon="shield" text={home.privacy.strip.text} link={home.privacy.strip.link} />
        </Gap>
      </Section>

      {work.items.length > 0 && (
        <Section tone="white">
          <BlkHead title={home.work.title} link={home.work.link} />
          <WorkTiles items={work.items.slice(0, 3)} />
        </Section>
      )}

      {updates.items.length > 0 && (
        <Section tone="grey">
          <BlkHead title={home.updates.title} link={home.updates.link} />
          <PostList items={updates.items.slice(0, 3)} />
        </Section>
      )}

      <Section tone="white">
        <BlkHead title={home.faq.title} />
        <Faq items={home.faq.items} />
      </Section>

      <Cta />
    </main>
  );
}
