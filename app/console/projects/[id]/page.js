import Link from "next/link";
import { notFound } from "next/navigation";
import Chat from "@/components/console/Chat";
import ProjectFiles from "@/components/console/ProjectFiles";
import QuoteCard from "@/components/console/QuoteCard";
import { clientContext, fileSize, halves, projectStatus, stepName } from "@/lib/console";
import { eventValues } from "@/lib/events";
import { lagosDay, lagosShort, naira } from "@/lib/format";
import { format } from "@/lib/text";
import { loadMessages, onlineLine, shapeMessages } from "@/lib/threads";
import copy from "@/content/console/project";
import events from "@/content/console/events";
import billing from "@/content/console/billing";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const ctx = await clientContext();
  const { data } = await ctx.supabase.from("projects").select("title").eq("id", id).maybeSingle();
  return { title: data ? `${data.title}, Titan Wave Media Console` : "Titan Wave Media Console" };
}

export default async function ProjectPage({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const ctx = await clientContext();
  const db = ctx.supabase;
  const { data: project } = await db.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) notFound();

  const [quotes, updates, files, invoices, thread] = await Promise.all([
    db.from("quotes").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(1),
    db.from("project_updates").select("kind, body, data, created_at, created_by").eq("project_id", id).order("created_at", { ascending: true }),
    db.from("project_files").select("id, name, size_bytes, from_team, created_at").eq("project_id", id).order("created_at", { ascending: false }),
    db.from("invoices").select("number, title, total_kobo, status, kind").eq("project_id", id).order("issued_at", { ascending: true }),
    db.from("threads").select("id").eq("project_id", id).eq("kind", "project").maybeSingle(),
  ]);
  const quote = quotes.data && quotes.data[0];
  const firstHalf = (invoices.data || []).find((i) => i.kind === "setup_first");

  let next = project.next_note || copy.next.byStep[project.step];
  if (!project.next_note && quote && quote.status === "sent") next = copy.next.quoteWaiting;
  if (!project.next_note && firstHalf && firstHalf.status === "due") next = copy.next.firstHalfDue;

  const messages = thread.data ? shapeMessages(await loadMessages(thread.data.id), { viewer: "client", userId: ctx.user.id, you: copy.chat.you }) : [];
  const online = onlineLine(copy.chat);
  const isOwner = ctx.role === "owner";

  const updateText = (u) => {
    const words = copy.updates.kinds[u.kind];
    if (!words) return "";
    const v = eventValues(u.data || {});
    if (u.kind === "file") v.who = u.created_by === ctx.user.id || !(u.data && u.data.team) ? copy.updates.you : copy.updates.us;
    if (u.kind === "note") v.body = u.body || "";
    return format(words, v);
  };

  return (
    <>
      <div className="c-head">
        <div>
          <p className="c-head__crumb">
            <Link className="link" href="/console/projects">
              {copy.crumb}
            </Link>
          </p>
          <h1>{project.title}</h1>
          {project.summary && <p className="c-lede">{project.summary.slice(0, 400)}</p>}
        </div>
        <span className="c-chip c-chip--solid">{projectStatus(project, quote)}</span>
      </div>

      <ol className="c-steps" aria-label={copy.stepsLabel}>
        {events.steps.map((s, i) => {
          const n = i + 1;
          const state = n < project.step ? "is-done" : n === project.step ? "is-now" : undefined;
          return (
            <li key={s} className={state} aria-current={n === project.step ? "step" : undefined}>
              <b>{n}</b>
              {n < project.step ? format(copy.stepDone, { step: s }) : n === project.step ? format(copy.stepNow, { step: s }) : s}
            </li>
          );
        })}
      </ol>

      <div className="c-split c-sec">
        <div className="c-stack">
          <div className="c-card">
            <h2>{copy.next.title}</h2>
            <p style={{ marginTop: 6 }}>{next}</p>
            {firstHalf && firstHalf.status === "due" && isOwner && (
              <div className="btns" style={{ marginTop: 12 }}>
                <Link className="btn btn--solid" href={`/console/invoices/${firstHalf.number}?pay=1`}>
                  {billing.payInvoice}
                </Link>
                <Link className="btn" href={`/console/invoices/${firstHalf.number}`}>
                  {billing.seeInvoice}
                </Link>
              </div>
            )}
          </div>

          {quote && (
            <QuoteCard
              projectId={project.id}
              isOwner={isOwner}
              business={ctx.business.name}
              quote={{
                status: quote.status,
                setup: naira(quote.setup_kobo),
                first: naira(halves(quote.setup_kobo).first),
                second: naira(halves(quote.setup_kobo).second),
                care: quote.care_kobo ? naira(quote.care_kobo) : null,
                summary: quote.summary,
                sent: lagosDay(quote.created_at),
                decided: quote.decided_at ? lagosDay(quote.decided_at) : null,
              }}
            />
          )}

          <div className="c-card">
            <h2>{copy.updates.title}</h2>
            {updates.data && updates.data.length ? (
              <ol className="c-timeline" style={{ marginTop: 12 }}>
                {updates.data.map((u, i) => (
                  <li key={i}>
                    <time dateTime={u.created_at}>{lagosShort(u.created_at)}</time>
                    {updateText(u)}
                  </li>
                ))}
              </ol>
            ) : (
              <p style={{ marginTop: 6 }}>{copy.updates.empty}</p>
            )}
          </div>

          <ProjectFiles
            projectId={project.id}
            files={(files.data || []).map((f) => ({
              id: f.id,
              name: f.name,
              line: format(f.from_team ? copy.files.fromUs : copy.files.fromYou, { date: lagosDay(f.created_at), size: fileSize(f.size_bytes) }),
            }))}
          />

          <div className="c-card">
            <h2>{copy.payments.title}</h2>
            {invoices.data && invoices.data.length ? (
              <div className="c-tw" style={{ marginTop: 12 }}>
                <table>
                  <thead>
                    <tr>
                      <th>{copy.payments.invoice}</th>
                      <th className="num">{copy.payments.amount}</th>
                      <th>{copy.payments.status}</th>
                      <th>
                        <span className="sr-only">{billing.actions}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.data.map((inv) => (
                      <tr key={inv.number}>
                        <td>
                          <Link className="link" href={`/console/invoices/${inv.number}`}>
                            {inv.title}
                          </Link>
                        </td>
                        <td className="num">{naira(inv.total_kobo)}</td>
                        <td>
                          <span className={`c-chip ${inv.status === "paid" ? "c-chip--ok" : ""}`}>{billing.invoiceStatus[inv.status]}</span>
                        </td>
                        <td>
                          {inv.status === "due" && isOwner && (
                            <Link className="btn btn--sm" href={`/console/invoices/${inv.number}?pay=1`}>
                              {copy.payments.pay}
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ marginTop: 6 }}>{copy.payments.empty}</p>
            )}
          </div>
        </div>

        <Chat
          title={copy.chat.title}
          status={online}
          url={`/api/console/projects/${project.id}/messages`}
          initial={messages}
          words={{ label: copy.chat.label, placeholder: copy.chat.placeholder, send: copy.chat.send, empty: copy.chat.empty, failed: copy.chat.failed }}
          inputId="pj-in"
        />
      </div>
    </>
  );
}
