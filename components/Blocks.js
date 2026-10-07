import Link from "next/link";
import Icon from "./Icon";
import Btn from "./Btn";
import Rich from "./Rich";
import NotifyForm from "./NotifyForm";
import NotifyButton from "./NotifyButton";
import WorkTile from "./WorkTile";
import site from "@/content/site";
import products from "@/content/products";
import productList, { priceOf } from "@/content/product-list";
import work from "@/content/work";
import { format, isPh, ph } from "@/lib/text";

export function Section({ tone = "white", id, children }) {
  return (
    <section className={`blk blk--${tone}`} id={id}>
      <div className="wrap">{children}</div>
    </section>
  );
}

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

export function Gap({ children }) {
  return <div style={{ marginTop: "var(--gap)" }}>{children}</div>;
}

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

export function OutLink({ href, label, className }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      <span>{label}</span>
      <span className="sr-only">{`, ${site.newTab}`}</span>
    </a>
  );
}

export function StatusTag({ status }) {
  return (
    <span className="tag" data-status={status}>
      {productList.status[status]}
    </span>
  );
}

export function ProductCard({ item }) {
  const c = products.card;
  const values = { name: item.name, slug: item.slug };
  return (
    <div className="pcard" data-cat={item.cat}>
      <div className="pcard__top">
        <Icon name={item.icon || "tool"} />
        <StatusTag status={item.status} />
      </div>
      <h3>{item.name}</h3>
      <p>{item.text}</p>
      <p className="pcard__price">{priceOf(item)}</p>
      <div className="btns" style={{ marginTop: 12 }}>
        <Btn href={`/products/${item.slug}`} label={c.details} style="line" size="sm" plain />
        {item.status === "live" && item.url ? (
          <OutLink href={item.url} label={format(c.open, values)} className="btn btn--line btn--sm" />
        ) : item.status === "available" ? (
          <Btn href={format(c.talk.href, values)} label={c.talk.label} style="line" size="sm" plain />
        ) : (
          <NotifyButton label={c.notify} />
        )}
      </div>
    </div>
  );
}

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
