import Link from "next/link";
import { notFound } from "next/navigation";
import Chat from "@/components/console/Chat";
import Status from "@/components/console/Status";
import ProjectFiles from "@/components/console/ProjectFiles";
import ProjectControls from "@/components/console/team/ProjectControls";
import { fileSize, teamContext } from "@/lib/console";
import { lagosDay, naira } from "@/lib/format";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import { loadMessages, shapeMessages } from "@/lib/threads";
import copy from "@/content/console/team-project";
import project from "@/content/console/project";
import billing from "@/content/console/billing";
import events from "@/content/console/events";

export const metadata = { title: "Project, Titan Wave Media Console" };

export default async function TeamProjectPage({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const ctx = await teamContext();
  const admin = getAdmin();
  const { data: p } = await admin.from("projects").select("*, businesses(name)").eq("id", id).maybeSingle();
  if (!p) notFound();
  const [quotes, files, invoices, thread] = await Promise.all([
    admin.from("quotes").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(1),
    admin.from("project_files").select("id, name, size_bytes, from_team, created_at").eq("project_id", id).order("created_at", { ascending: false }),
    admin.from("invoices").select("number, title, total_kobo, status").eq("project_id", id).order("issued_at"),
    admin.from("threads").select("id").eq("project_id", id).eq("kind", "project").maybeSingle(),
  ]);
  const quote = quotes.data && quotes.data[0];
  const business = p.businesses ? p.businesses.name : "";
  const messages = thread.data ? shapeMessages(await loadMessages(thread.data.id), { viewer: "team", userId: ctx.user.id, you: project.chat.you }) : [];

  return (
    <>
      <div className="c-head">
        <div>
          <p className="c-head__crumb">
            <Link className="link" href="/console/team/clients">
              {copy.crumb}
            </Link>
          </p>
          <h1>{p.title}</h1>
          <p className="c-lede">
            {format(copy.for, { business })}
          </p>
        </div>
      </div>
      <ol className="c-steps" aria-label={project.stepsLabel}>
        {events.steps.map((s, i) => (
          <li key={s} className={i + 1 < p.step ? "is-done" : i + 1 === p.step ? "is-now" : undefined} aria-current={i + 1 === p.step ? "step" : undefined}>
            <b>{i + 1}</b>
            {s}
          </li>
        ))}
      </ol>
      <div className="c-split c-sec">
        <div className="c-stack">
          <ProjectControls
            projectId={p.id}
            step={p.step}
            nextNote={p.next_note}
            quoteLine={quote ? format(copy.quote.current, { setup: naira(quote.setup_kobo), care: naira(quote.care_kobo), status: copy.quote.states[quote.status] }) : null}
          />
          <ProjectFiles
            projectId={p.id}
            files={(files.data || []).map((f) => ({
              id: f.id,
              name: f.name,
              line: `${lagosDay(f.created_at)}, ${fileSize(f.size_bytes)}`,
            }))}
          />
          <div className="c-card">
            <h2>{project.payments.title}</h2>
            {invoices.data && invoices.data.length ? (
              <ul className="c-list" style={{ marginTop: 10 }}>
                {invoices.data.map((inv) => (
                  <li key={inv.number}>
                    <span>
                      <Link className="link" href={`/console/invoices/${inv.number}`}>
                        {inv.number}
                      </Link>
                      , {inv.title}
                    </span>
                    <span className="c-list__end">
                      {naira(inv.total_kobo)}, <Status kind="invoice" value={inv.status} label={billing.invoiceStatus[inv.status]} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ marginTop: 6 }}>{project.payments.empty}</p>
            )}
          </div>
        </div>
        <Chat
          title={format(copy.chat.title, { business })}
          url={`/api/console/projects/${p.id}/messages`}
          initial={messages}
          inputId="tp-chat"
          words={{ label: project.chat.label, placeholder: project.chat.placeholder, send: project.chat.send, empty: project.chat.empty, failed: project.chat.failed }}
        />
      </div>
    </>
  );
}
