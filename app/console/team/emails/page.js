import Link from "next/link";
import { teamContext } from "@/lib/console";
import { emailExample } from "@/lib/emailExamples";
import { renderEmail } from "@/lib/mail";
import { format } from "@/lib/text";
import copy from "@/content/console/team-emails";
import emails from "@/content/console/emails";

export const metadata = { title: copy.meta.title };

const FROM = process.env.CONTACT_FROM_EMAIL || "Titan Wave Media <onboarding@resend.dev>";

export default async function TeamEmailsPage({ searchParams }) {
  await teamContext();
  const sp = await searchParams;
  const keys = Object.keys(emails.templates);
  const key = keys.includes(sp.e) ? sp.e : keys[0];
  const t = emails.templates[key];
  const ex = await emailExample(key);
  const rendered = renderEmail(key, ex.data, { url: ex.url, noButtonText: key === "reply" ? emails.templates.reply.noAccount : null, images: "preview" });

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      <div className="c-mail">
        <nav aria-label={copy.listLabel}>
          <ul className="c-inbox__list">
            {keys.map((k) => (
              <li key={k}>
                <Link href={`/console/team/emails?e=${k}`} aria-current={k === key ? "true" : undefined}>
                  <b>{emails.templates[k].name}</b>
                  <p>{emails.templates[k].when}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="c-mail__view">
          <div className="c-mail__hdr">
            <h2>{rendered.subject}</h2>
            <p>
              <b>{copy.from}</b> {FROM}
              <br />
              <b>{copy.to}</b> {ex.to}
              <br />
              <b>{copy.when}</b> {t.when}
              <br />
              {ex.what ? format(copy.example, { what: ex.what }) : copy.blank}
            </p>
          </div>
          <iframe className="c-mail__frame" title={format(copy.frameTitle, { name: t.name })} srcDoc={rendered.html} sandbox="" />
        </div>
      </div>
    </>
  );
}
