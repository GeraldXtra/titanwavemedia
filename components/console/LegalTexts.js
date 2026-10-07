import Rich from "../Rich";
import privacyPolicy from "@/content/privacy-policy";
import terms from "@/content/terms";
import refunds from "@/content/refunds";

function Doc({ content }) {
  return (
    <div className="c-legal">
      {content.sections.map((s, i) => (
        <section key={i}>
          <h3>{s.title}</h3>
          {s.body.map((block, j) =>
            block && block.list ? (
              <ul key={j}>
                {block.list.map((item, k) => (
                  <li key={k}>
                    <Rich text={item} linkClass="link" />
                  </li>
                ))}
              </ul>
            ) : (
              <p key={j}>
                <Rich text={block} linkClass="link" />
              </p>
            )
          )}
        </section>
      ))}
    </div>
  );
}

export function legalDocs() {
  return {
    updated: privacyPolicy.hero.updated,
    privacy: <Doc content={privacyPolicy} />,
    terms: <Doc content={terms} />,
    refunds: <Doc content={refunds} />,
  };
}
