import { Fragment } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import Rich from "./Rich";
import { Year } from "./Live";
import Email from "./Email";
import site from "@/content/site";
import { emailHref, isPh } from "@/lib/text";

const f = site.footer;

// A placeholder social link points at the contact page until its address is filled in.
function Social({ item }) {
  if (!item.href) {
    return (
      <Link href="/contact">
        <Rich text={item.label} />
      </Link>
    );
  }
  return (
    <a href={item.href} target="_blank" rel="noopener">
      <Rich text={item.label} />
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__top">
          <div className="foot__brand">
            <Link className="brand" href="/" aria-label={site.header.homeLabel}>
              <BrandMark />
              <span className="brand__name">{site.name}</span>
            </Link>
            <p>{f.text}</p>
          </div>
          {f.columns.map((col) => (
            <nav aria-label={col.title} key={col.title}>
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2>{f.talk.title}</h2>
            <ul>
              <li>
                <a href={site.whatsappUrl} target="_blank" rel="noopener">
                  {f.talk.whatsapp}
                </a>
              </li>
              <li>
                {isPh(site.email) ? (
                  <Link href={emailHref(site.email)}>
                    <Rich text={site.email} />
                  </Link>
                ) : (
                  <a href={emailHref(site.email)}>
                    <Email address={site.email} />
                  </a>
                )}
              </li>
              <li>{site.location}</li>
              <li>
                <Rich text={f.talk.time} />
              </li>
              <li>
                {site.social.map((s, i) => (
                  <Fragment key={i}>
                    {i > 0 && f.talk.socialJoin}
                    <Social item={s} />
                  </Fragment>
                ))}
              </li>
            </ul>
          </div>
        </div>
        <p className="foot__word rv-word" aria-hidden="true" data-letters="">
          {f.wordmark.split("").map((ch, i) =>
            ch === " " ? (
              " "
            ) : (
              <span className="l" style={{ "--i": i }} key={i}>
                {ch}
              </span>
            )
          )}
        </p>
        <div className="foot__base">
          <div className="foot__co">
            <span>{site.legalName}</span>
            <span>
              <Rich text={f.rcLine} />
            </span>
            <span>{site.location}</span>
          </div>
          <nav className="foot__legal" aria-label={f.legalLabel}>
            {f.legal.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
          <span>
            © <Year initial={new Date().getFullYear()} /> {f.copyright}
          </span>
        </div>
      </div>
    </footer>
  );
}
