import Link from "next/link";
import Rich from "./Rich";
import { Year } from "./Live";
import Email from "./Email";
import CookiePrefs from "./CookiePrefs";
import site from "@/content/site";
import { emailHref } from "@/lib/text";

const f = site.footer;

// A link in a footer column: a page, the WhatsApp chat, or the company email.
function FootLink({ item }) {
  if (item.whatsapp) {
    return (
      <a href={site.whatsappUrl} target="_blank" rel="noopener">
        {item.label}
      </a>
    );
  }
  if (item.email) {
    return (
      <a href={emailHref(site.email)}>
        <Email address={site.email} />
      </a>
    );
  }
  return <Link href={item.href}>{item.label}</Link>;
}

// Four columns of plain links, then a bottom row with the company line and the policies.
export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__cols">
          {f.columns.map((col) => (
            <nav aria-label={col.title} key={col.title}>
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l, i) => (
                  <li key={i}>
                    <FootLink item={l} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="foot__base">
          <p>
            <Rich text={f.base} tokens={{ year: <Year initial={new Date().getFullYear()} /> }} />
          </p>
          <ul className="foot__legal" aria-label={f.baseLabel}>
            {f.baseLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
            <li>
              <CookiePrefs copy={site.cookies} />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
