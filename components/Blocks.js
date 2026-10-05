import Link from "next/link";
import Icon from "./Icon";
import Btn from "./Btn";
import Rich from "./Rich";
import NotifyForm from "./NotifyForm";
import NotifyButton from "./NotifyButton";
import WorkTile from "./WorkTile";
import site from "@/content/site";
import products from "@/content/products";
import work from "@/content/work";
import { format, isPh, ph } from "@/lib/text";

// A full width block. `tone` is white, grey or black.
export function Section({ tone = "white", id, children }) {
  return (
    <section className={`blk blk--${tone}`} id={id}>
      <div className="wrap">{children}</div>
    </section>
  );
}

// The big heading at the top of a block, with a line of text or a link beside it.
export function BlkHead({ title, text, link }) {
  return (
    <div className="blk__head">
      <h2>{title}</h2>
      <div>
        {text && <p>{text}</p>}
        {link && (
          <p style={{ marginTop: 12 }}>
            <Link className="link" href={link.href}>
              {link.label}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

// Text that may be a placeholder: a whole placeholder is plain text on an element with the
// "ph" class (see ph() in lib/text.js); anything else can carry links and {tokens}.
export function Copy({ text, linkClass }) {
  return isPh(text) ? text : <Rich text={text} linkClass={linkClass} />;
}

export function Cards({ n, cards }) {
  return (
    <div className="cards" style={{ "--n": n }}>
      {cards.map((card, i) => (
        <div className="card" key={i}>
          <Icon name={card.icon} />
          <h3>{card.title}</h3>
          <p>{card.text}</p>
        </div>
      ))}
    </div>
  );
}

// A numbered list of steps, as on the AI Setup page.
export function StepList({ steps }) {
  return (
    <ol className="steps steps--list">
      {steps.map((step, i) => (
        <li key={i}>
          <b aria-hidden="true">{i + 1}</b>
          <div>
            <h3>
              <span className="sr-only">{format(site.stepLabel, { n: i + 1 })}</span>
              {step.title}
            </h3>
            <p>{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Faq({ items }) {
  return (
    <div className="faq">
      {items.map((item, i) => (
        <details key={i}>
          <summary>{item.q}</summary>
          <p className={ph(item.a)}>
            <Copy text={item.a} linkClass="link" />
          </p>
        </details>
      ))}
    </div>
  );
}

// A thin bar with an icon and a line of text, and a link or button on the right.
export function Strip({ icon, text, link, button, style, children }) {
  return (
    <div className="strip" style={style}>
      <p>
        <Icon name={icon} />
        {text}
      </p>
      {link && (
        <Link className="link" href={link.href}>
          {link.label}
        </Link>
      )}
      {button && <Btn href={button.href} label={button.label} style="line" size="sm" />}
      {children}
    </div>
  );
}

// Space above a block that follows another one in the same section.
export function Gap({ children }) {
  return <div style={{ marginTop: "var(--gap)" }}>{children}</div>;
}

// The closing "Tell us what you need" block. Pages can change the title and buttons.
export function Cta({ cta }) {
  const c = { ...site.cta, ...cta };
  return (
    <section className="blk blk--grey">
      <div className="wrap">
        <div className="cta">
          <div>
            <h2>{c.title}</h2>
            <p className="note" style={{ marginTop: 14 }}>
              <Rich text={c.note} />
            </p>
          </div>
          <div className="btns">
            {c.buttons.map((b, i) => (
              <Btn key={i} href={b.href} label={b.label} style={b.style} icon={b.icon} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// The "Get told when it launches" box with its email form.
export function Notify({ title, text, thanks, inputId, source }) {
  return (
    <div className="notify">
      <div>
        <h3>{title}</h3>
        {text && <p>{text}</p>}
      </div>
      <NotifyForm inputId={inputId} thanks={thanks} source={source} />
    </div>
  );
}

export function ProductCard({ item }) {
  return (
    <div className="pcard" data-cat={item.cat}>
      <div className="pcard__top">
        <Icon name={item.icon || "tool"} />
        <span className="tag">{item.tag}</span>
      </div>
      <h3 className={ph(item.name)}>{item.name}</h3>
      <p className={ph(item.text)}>{item.text}</p>
      <p className={ph(item.price, "pcard__price")}>{item.price}</p>
      <div className="btns" style={{ marginTop: 12 }}>
        <Btn href={`/products/${item.slug}`} label={products.card.details} style="line" size="sm" plain />
        <NotifyButton label={products.card.notify} />
      </div>
    </div>
  );
}

// The sideways row of product cards.
export function ProductRow({ items, list }) {
  return (
    <div className="row" data-list={list ? "" : undefined}>
      {items.map((item, i) => (
        <ProductCard key={i} item={item} />
      ))}
    </div>
  );
}

export function WorkTiles({ items, list }) {
  return (
    <div className="wtiles" data-list={list ? "" : undefined}>
      {items.map((item, i) => (
        <WorkTile key={i} item={item} flip={work.flip} />
      ))}
    </div>
  );
}

export function PostList({ items }) {
  return (
    <ul className="posts" data-list="">
      {items.map((post, i) => (
        <li className="post-li" data-cat={post.cat} key={i}>
          <Link className="post" href={`/updates/${post.slug}`}>
            <time className={ph(post.date)} dateTime={post.datetime}>
              {post.date}
            </time>
            <div>
              <h3 className={ph(post.title)}>{post.title}</h3>
              <p className={ph(post.summary)}>{post.summary}</p>
            </div>
            <span className="tag">{post.tag}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// The "On this page" bar that follows you and lights the section you are in.
export function Subnav({ links }) {
  return (
    <nav className="subnav" aria-label={site.onThisPage}>
      <div className="wrap">
        <ul>
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} data-jump="" data-spy={l.id}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
