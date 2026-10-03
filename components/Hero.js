import Link from "next/link";
import Wave from "./Wave";
import Btn from "./Btn";
import { cx } from "@/lib/text";

export function Crumbs({ items }) {
  return (
    <ol className="crumbs">
      {items.map((item, i) =>
        item.href ? (
          <li key={i}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ) : (
          <li key={i} aria-current="page">
            {item.label}
          </li>
        )
      )}
    </ol>
  );
}

// The black block at the top of every page. `home` is the large version without "hero--page".
export default function Hero({ title, text, home = false, crumbs, buttons, children }) {
  return (
    <section className={cx("hero", !home && "hero--page")}>
      <Wave kind="night" className="hero__bg" />
      <div className="wrap">
        {crumbs && <Crumbs items={crumbs} />}
        <h1 tabIndex={-1}>{title}</h1>
        {text && <p className="hero__text">{text}</p>}
        {buttons && (
          <div className="btns">
            {buttons.map((b, i) => (
              <Btn key={i} href={b.href} label={b.label} style={b.style} icon={b.icon} />
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
