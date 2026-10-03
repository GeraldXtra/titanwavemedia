import Hero from "./Hero";
import Rich from "./Rich";
import site from "@/content/site";

// Terms, Privacy Policy and Refund Policy: a contents list that follows you, and the text.
export default function LegalPage({ id, content }) {
  const anchor = (i) => `${id}-${i}`;
  return (
    <main className="page" id={`main-${id}`}>
      <Hero title={content.hero.title}>
        <p className="updated">
          <Rich text={content.hero.updated} />
        </p>
      </Hero>
      <section className="mod">
        <div className="wrap legal">
          <nav aria-label={content.tocLabel || site.onThisPage}>
            <ol className="toc">
              {content.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#${anchor(i)}`} data-jump="" data-spy={anchor(i)}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="prose">
            {content.sections.map((s, i) => (
              <Section key={i} id={anchor(i)} section={s} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({ id, section }) {
  return (
    <>
      <h2 id={id}>{section.title}</h2>
      {section.body.map((block, j) =>
        block && block.list ? (
          <ul key={j}>
            {block.list.map((item, k) => (
              <li key={k}>
                <Rich text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={j}>
            <Rich text={block} />
          </p>
        )
      )}
    </>
  );
}
