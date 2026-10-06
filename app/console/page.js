import Link from "next/link";
import Icon from "@/components/Icon";
import { clientContext, projectStatus, stepName } from "@/lib/console";
import { eventText } from "@/lib/events";
import { daysUntil, lagosClock, lagosDay, lagosParts, lagosShort, lagosToday, naira } from "@/lib/format";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import copy from "@/content/console/home";
import events from "@/content/console/events";

export const metadata = { title: copy.meta.title };

const ICONS = {
  account_created: "users",
  member_joined: "users",
  member_invited: "users",
  member_removed: "users",
  twostep_on: "lock",
  twostep_off: "lock",
  twostep_removed: "lock",
  project_requested: "folder",
  file_sent: "upload",
  file_team: "upload",
  ticket_opened: "chat",
  product_interest: "bell",
  message: "mail",
  quote_request: "mail",
  assist_on: "chat",
  assist_off: "chat",
  assist_setup: "chat",
  assist_answer: "chat",
};

export default async function ConsoleHome() {
  const ctx = await clientContext();
  const db = ctx.supabase;
  const admin = getAdmin();
  const biz = ctx.business;

  const [invoices, projects, quotes, activity, websiteMessages, members, cards] = await Promise.all([
    db.from("invoices").select("number, title, total_kobo, due_on").eq("status", "due").order("due_on", { ascending: true }),
    db.from("projects").select("id, title, summary, step, next_note, created_at").order("created_at", { ascending: false }),
    db.from("quotes").select("project_id, status").eq("status", "sent"),
    db.from("activity").select("kind, data, created_at").order("created_at", { ascending: false }).limit(8),
    admin.from("threads").select("kind, created_at").eq("from_email", ctx.email).in("kind", ["contact", "quote"]).order("created_at", { ascending: false }).limit(5),
    admin.from("business_members").select("id", { count: "exact", head: true }).eq("business_id", biz.id),
    admin.from("saved_cards").select("id", { count: "exact", head: true }).eq("business_id", biz.id),
  ]);

  const hour = lagosParts().hour;
  const name = ctx.firstName;
  const greet = name ? format(hour < 12 ? copy.morning : hour < 17 ? copy.afternoon : copy.evening, { name }) : copy.greetNoName;

  const due = invoices.data || [];
  const dueTotal = due.reduce((a, i) => a + Number(i.total_kobo), 0);
  const first = due[0];
  const late = first && daysUntil(first.due_on) < 0;

  const list = projects.data || [];
  const waitingQuote = new Set((quotes.data || []).map((q) => q.project_id));
  const current = list.find((p) => p.step < 5) || list[0];

  const todo = [
    ["details", Boolean(biz.phone && biz.address)],
    ["twostep", ctx.twoStep],
    ["team", (members.count || 0) > 1],
    ["card", (cards.count || 0) > 0],
  ];
  const doneCount = todo.filter(([, d]) => d).length;

  const today = lagosToday();
  const when = (iso) => (lagosToday(0, new Date(iso)) === today ? lagosClock(new Date(iso)) : lagosShort(iso));
  const feed = [
    ...(activity.data || []).map((a) => ({ kind: a.kind, text: eventText("activity", a.kind, a.data), at: a.created_at })),
    ...(websiteMessages.data || []).map((m) => ({ kind: m.kind === "quote" ? "quote_request" : "message", text: m.kind === "quote" ? events.activity.quote_request : events.activity.message, at: m.created_at })),
  ]
    .filter((f) => f.text)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{greet}</h1>
          <p className="c-lede">{format(copy.lede, { business: biz.name })}</p>
        </div>
        <div className="btns">
          <Link className="btn btn--solid" href="/console/projects/new">
            <Icon name="plus" />
            {copy.start}
          </Link>
        </div>
      </div>

      {first && (
        <div className="c-due">
          <span className="c-due__text">
            <Icon name="card" />
            {format(due.length === 1 && !late ? copy.due.one : late ? copy.due.late : copy.due.many, {
              count: due.length,
              total: naira(dueTotal),
              number: first.number,
              date: lagosDay(first.due_on),
            })}
          </span>
          <span className="btns">
            <Link className="btn btn--sm" href={`/console/invoices/${first.number}`}>
              {copy.due.see}
            </Link>
            {ctx.role === "owner" && (
              <Link className="btn btn--sm" href={`/console/invoices/${first.number}?pay=1`}>
                {copy.due.pay}
              </Link>
            )}
          </span>
        </div>
      )}

      <div className="c-split">
        {current ? (
          <div className="c-card c-card--accent">
            <div className="c-row">
              <span className="c-chip c-chip--solid">{projectStatus(current, waitingQuote.has(current.id) ? { status: "sent" } : null)}</span>
              <span className="note">
                {format(copy.project.stepOf, { n: current.step })}, {stepName(current.step)}
              </span>
            </div>
            <h2 style={{ marginTop: 12 }}>{current.title}</h2>
            {current.summary && <p style={{ marginTop: 6 }}>{current.summary.slice(0, 220)}</p>}
            <div className="c-progress" aria-hidden="true">
              <i style={{ width: `${current.step * 20}%` }} />
            </div>
            <p style={{ marginTop: 14 }}>
              <Link className="link" href={`/console/projects/${current.id}`}>
                {copy.project.open}
              </Link>
              {list.length > 1 && (
                <>
                  {"  ·  "}
                  <Link className="link" href="/console/projects">
                    {format(copy.project.more, { count: list.length })}
                  </Link>
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="c-empty">
            <h2>{copy.project.emptyTitle}</h2>
            <p>{copy.project.emptyText}</p>
            <div className="btns">
              <Link className="btn" href="/console/projects/new">
                {copy.project.emptyButton}
              </Link>
            </div>
          </div>
        )}

        <div className="c-card">
          <div className="c-row">
            <h2>{copy.todo.title}</h2>
            <span className="note">{format(copy.todo.count, { done: doneCount, total: todo.length })}</span>
          </div>
          <ul className="c-todo" style={{ marginTop: 8 }}>
            {todo.map(([key, done]) => (
              <li key={key} className={done ? "is-done" : undefined}>
                <span className="c-todo__box" aria-hidden="true">
                  <Icon name="check" />
                </span>
                {done ? (
                  <span>
                    {copy.todo.items[key].label}
                    <span className="sr-only">, {copy.todo.done}</span>
                  </span>
                ) : (
                  <Link className="link" href={copy.todo.items[key].href}>
                    {copy.todo.items[key].label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="c-sec c-card">
        <h2>{copy.activity.title}</h2>
        {feed.length ? (
          <ul className="c-list" style={{ marginTop: 12 }}>
            {feed.map((f, i) => (
              <li key={i}>
                <Icon name={ICONS[f.kind] || "card"} />
                <span>{f.text}</span>
                <time dateTime={f.at}>{when(f.at)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ marginTop: 8 }}>{copy.activity.empty}</p>
        )}
      </section>
    </>
  );
}
