import Link from "next/link";
import Icon from "@/components/Icon";
import HelpForm from "@/components/console/HelpForm";
import { clientContext } from "@/lib/console";
import { lagosShort } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import site from "@/content/site";
import shell from "@/content/console/shell";
import copy from "@/content/console/help";

export const metadata = { title: copy.meta.title };

export default async function HelpPage() {
  const ctx = await clientContext();
  const { data: tickets } = await ctx.supabase.from("threads").select("id, subject, status, last_message_at").eq("kind", "help").order("last_message_at", { ascending: false });
  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
        <div className="btns">
          <a className="btn" href={waLink(site.whatsappUrl, shell.footer.whatsappText)} target="_blank" rel="noopener">
            <Icon name="wa" />
            {copy.whatsapp}
          </a>
        </div>
      </div>
      <div className="c-split">
        <HelpForm />
        <section className="c-card">
          <h2>{copy.list.title}</h2>
          {tickets && tickets.length ? (
            <div className="c-tw" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th>{copy.list.subject}</th>
                    <th>{copy.list.updated}</th>
                    <th>{copy.list.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Link className="link" href={`/console/help/${t.id}`}>
                          {t.subject}
                        </Link>
                      </td>
                      <td>{lagosShort(t.last_message_at)}</td>
                      <td>
                        <span className={`c-chip ${t.status === "new" ? "c-chip--solid" : t.status === "solved" ? "c-chip--grey" : "c-chip--ok"}`}>{copy.status[t.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ marginTop: 6 }}>{copy.list.empty}</p>
          )}
        </section>
      </div>
    </>
  );
}
