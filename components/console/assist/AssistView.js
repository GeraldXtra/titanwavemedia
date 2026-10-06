import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "../../Icon";
import AssistSwitch from "./AssistSwitch";
import LimitForm from "./LimitForm";
import SetupForm from "./SetupForm";
import TestChat from "./TestChat";
import CopyCode from "./CopyCode";
import { AddAnswer, MarkHandled } from "./AssistActions";
import { FILTERS, assistStats, listConversations, openQuestions, waitingHandovers } from "@/lib/assist/console";
import { ensureAssistant, installCode } from "@/lib/assist/store";
import { testToken } from "@/lib/assist/token";
import { lagosDay, lagosDayTime, lagosShort } from "@/lib/format";
import { siteUrl } from "@/lib/seo";
import { format } from "@/lib/text";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/assist";
import chatWords from "@/content/assist";

// Wave Assist for one business: the switch and the numbers at the top, then the tabs (Setup,
// Test, Install, Conversations, Questions it couldn't answer). The client console and Team view
// show the same page:
// - db: the person's own client (row level security) for their business, or the service client
//   in Team view, after teamContext();
// - base: the page's own address, which the tabs and the conversation links build on;
// - team: Team view, so actions name the business and the monthly limit can be changed.

export const TABS = ["setup", "test", "install", "conversations", "questions"];

const nameOf = (a) => String(a.name || "").trim() || chatWords.noName;
const n = (x) => Number(x || 0).toLocaleString("en-NG");

async function Stats({ load }) {
  const stats = await load;
  const s = copy.stats;
  const m = stats.month;
  return (
    <section className="c-stats c-stats--5" aria-label={s.label}>
      <div className="c-stat c-stat--strong">
        <small>{s.conversations}</small>
        <b>{n(stats.total)}</b>
        <span>{s.conversationsSub}</span>
      </div>
      <div className="c-stat">
        <small>{s.answered}</small>
        <b>{stats.percent == null ? s.none : `${stats.percent}%`}</b>
        <span>{stats.percent == null ? s.noneSub : format(s.answeredSub, { answered: n(stats.answered), total: n(stats.under) })}</span>
      </div>
      <div className="c-stat">
        <small>{s.handed}</small>
        <b>{n(stats.handed)}</b>
        <span>{s.handedSub}</span>
      </div>
      <div className="c-stat">
        <small>{s.busiest}</small>
        <b>{stats.busiest ? format(s.busiestValue, stats.busiest) : s.none}</b>
        <span>{stats.busiest ? s.busiestSub : s.noneSub}</span>
      </div>
      <div className="c-stat">
        <small>{s.month}</small>
        <b>{format(s.monthValue, { used: n(m.used), limit: n(m.limit) })}</b>
        <span>{m.over ? format(s.monthOver, { count: n(m.over) }) : s.monthSub}</span>
      </div>
    </section>
  );
}

// Conversations started on each of the last 14 days. One series, so no legend: the title says
// what it shows. Each day is a list item a screen reader reads as "5 Oct: 3"; the bars are for
// the eye, and a pointer over one shows its day and number.
function DayChart({ days }) {
  const t = copy.conversations;
  const max = Math.max(0, ...days.map((d) => d.count));
  if (!max) return null;
  const peak = days.reduce((best, d, i) => (d.count >= days[best].count ? i : best), 0);
  return (
    <section className="c-card as-chart" aria-labelledby="as-chart-h">
      <div className="c-row">
        <h2 id="as-chart-h">{t.chartTitle}</h2>
        <span className="note">{t.chartSub}</span>
      </div>
      <ol className="as-bars">
        {days.map((d, i) => {
          const label = format(t.chartDay, { day: lagosShort(d.day), count: d.count });
          const height = `${Math.round((d.count / max) * 100)}%`;
          return (
            <li key={d.day}>
              <span className="sr-only">{label}</span>
              <span className="as-bars__plot" aria-hidden="true">
                <span className="as-bars__area">
                  <i style={{ height }} />
                  {i === peak && (
                    <b className="as-bars__value" style={{ bottom: height }}>
                      {d.count}
                    </b>
                  )}
                </span>
                <span className="as-bars__tip">{label}</span>
              </span>
              <small aria-hidden="true">{Number(d.day.slice(8))}</small>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function TestPanel({ assistant }) {
  const t = copy.test;
  const token = testToken(assistant);
  if (!token) {
    return (
      <div className="c-empty">
        <p>{t.noToken}</p>
      </div>
    );
  }
  const src = `/assist/chat?id=${assistant.public_id}&test=${encodeURIComponent(token)}`;
  return (
    <div className="as-testsplit">
      <TestChat src={src} title={format(t.frameTitle, { business: nameOf(assistant) })} />
      <div className="c-card">
        <h2>{t.title}</h2>
        <p style={{ marginTop: 6 }}>{t.text}</p>
        <p className="note" style={{ marginTop: 10 }}>
          {t.notCounted}
        </p>
        {!assistant.is_on && <p className="as-warn">{t.off}</p>}
      </div>
    </div>
  );
}

function InstallPanel({ assistant, base }) {
  const t = copy.install;
  const sites = Array.isArray(assistant.sites) ? assistant.sites : [];
  if (!sites.length) {
    return (
      <div className="c-empty">
        <h2>{t.noSitesTitle}</h2>
        <p>{t.noSitesText}</p>
        <div className="btns">
          <Link className="btn" href={`${base}?tab=setup#as-sites`}>
            {t.noSitesLink}
          </Link>
        </div>
      </div>
    );
  }
  const code = installCode(assistant.public_id);
  const list = sites.join(", ");
  const m = t.mail;
  const body = [
    m.intro,
    code,
    t.steps.map((s) => `${s.name}: ${s.text}`).join("\r\n\r\n"),
    format(m.sites, { sites: list }),
    format(m.csp, { site: siteUrl }),
    m.thanks,
  ].join("\r\n\r\n");
  const mailto = `mailto:?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(body)}`;
  return (
    <div className="c-split">
      <div className="c-stack">
        <div className="c-card">
          <h2>{t.codeTitle}</h2>
          <p style={{ marginTop: 6 }}>{t.codeText}</p>
          <CopyCode code={code} />
          <p className="note" style={{ marginTop: 12 }}>
            {format(t.sites, { sites: list })}
          </p>
          <p className="note" style={{ marginTop: 6 }}>
            {assistant.seen_at ? format(t.seen, { site: assistant.seen_site || sites[0], date: lagosDayTime(assistant.seen_at) }) : t.notSeen}
          </p>
          {!assistant.is_on && <p className="as-warn">{t.off}</p>}
        </div>
        <div className="c-card">
          <h2>{t.cspTitle}</h2>
          <p style={{ marginTop: 6 }}>{format(t.csp, { site: siteUrl })}</p>
        </div>
      </div>
      <div className="c-card">
        <h2>{t.stepsTitle}</h2>
        <dl className="as-steps">
          {t.steps.map((s) => (
            <div key={s.name}>
              <dt>{s.name}</dt>
              <dd>{s.text}</dd>
            </div>
          ))}
        </dl>
        <div className="btns" style={{ marginTop: 16 }}>
          <a className="btn" href={mailto} aria-describedby="as-send-help">
            <Icon name="mail" />
            {t.send}
          </a>
        </div>
        <p className="note" id="as-send-help" style={{ marginTop: 8 }}>
          {t.sendHelp}
        </p>
      </div>
    </div>
  );
}

const linkableEmail = (e) => isEmail(e) && !/[?&#\s]/.test(e);

async function ConversationsPanel({ db, businessId, base, sp, team, stats }) {
  const t = copy.conversations;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const filter = FILTERS[sp.filter] ? sp.filter : "";
  const page = Math.max(1, Math.min(10000, parseInt(sp.page, 10) || 1));
  const [list, waiting, { days }] = await Promise.all([listConversations(db, businessId, { q, filter, page }), waitingHandovers(db, businessId), stats]);
  const href = ({ q: qq = q, filter: f = filter, page: p = 1 } = {}) => {
    const params = new URLSearchParams({ tab: "conversations" });
    if (qq) params.set("q", qq);
    if (f) params.set("filter", f);
    if (p > 1) params.set("page", String(p));
    return `${base}?${params}`;
  };
  const business = team ? businessId : undefined;
  const chip = { answered: "c-chip c-chip--ok", handed_over: "c-chip c-chip--solid", unanswered: "c-chip c-chip--grey" };
  const found = q ? format(list.count === 1 ? t.searchingOne : t.searching, { count: n(list.count), q }) : list.count === 1 ? t.foundOne : format(t.found, { count: n(list.count) });

  return (
    <div className="c-stack">
      {waiting.length > 0 && (
        <section className="c-card c-card--accent" aria-labelledby="as-wait-h">
          <h2 id="as-wait-h">
            {t.waitingTitle} <span className="c-chip c-chip--solid">{waiting.length}</span>
          </h2>
          <p style={{ marginTop: 6 }}>{t.waitingText}</p>
          <ul className="as-handovers">
            {waiting.map((h) => (
              <li key={h.id}>
                <div className="c-row">
                  <b>{h.name}</b>
                  <span className="note">{format(t.left, { date: lagosDayTime(h.created_at) })}</span>
                </div>
                <dl className="as-dl">
                  <dt>{t.phone}</dt>
                  <dd>
                    {h.phone ? (
                      <a className="link" href={`tel:${h.phone.replace(/[^\d+]/g, "")}`}>
                        {h.phone}
                      </a>
                    ) : (
                      t.notGiven
                    )}
                  </dd>
                  <dt>{t.email}</dt>
                  <dd>
                    {h.email && linkableEmail(h.email) ? (
                      <a className="link" href={`mailto:${h.email}`}>
                        {h.email}
                      </a>
                    ) : (
                      h.email || t.notGiven
                    )}
                  </dd>
                  <dt>{t.question}</dt>
                  <dd>{h.question || t.notGiven}</dd>
                </dl>
                <div className="btns">
                  <MarkHandled id={h.id} business={business} label={`${copy.conversations.handled}: ${h.name}`} />
                  <Link className="btn btn--sm" href={`${base}/conversations/${h.conversation_id}`} aria-label={format(t.openWith, { name: h.name })}>
                    {t.open}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <DayChart days={days} />

      <section aria-labelledby="as-list-h">
        <h2 id="as-list-h" className="sr-only">
          {copy.tabs.conversations}
        </h2>
        <div className="as-tools">
          <form className="as-search" action={base} method="get" role="search" aria-label={t.searchLabel}>
            <input type="hidden" name="tab" value="conversations" />
            {filter && <input type="hidden" name="filter" value={filter} />}
            <label htmlFor="as-q">{t.searchLabel}</label>
            <div className="as-search__row">
              <input id="as-q" type="search" name="q" defaultValue={q} maxLength={100} autoComplete="off" />
              <button className="btn" type="submit">
                <Icon name="search" />
                {t.search}
              </button>
            </div>
            {q && (
              <Link className="link as-search__clear" href={href({ q: "" })}>
                {t.clear}
              </Link>
            )}
          </form>
          <nav className="c-filter" aria-label={t.filtersLabel}>
            {["all", "answered", "handed", "unanswered"].map((f) => (
              <Link key={f} href={href({ filter: f === "all" ? "" : f })} aria-current={(filter || "all") === f ? "page" : undefined}>
                {t.filters[f]}
              </Link>
            ))}
          </nav>
        </div>
        <p className="note" style={{ margin: "10px 0" }} role="status">
          {found}
        </p>
        {list.rows.length ? (
          <div className="c-tw">
            <table>
              <thead>
                <tr>
                  <th>{t.table.when}</th>
                  <th>{t.table.first}</th>
                  <th className="num">{t.table.count}</th>
                  <th>{t.table.result}</th>
                  <th>
                    <span className="sr-only">{t.table.open}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.rows.map((c) => {
                  const when = lagosDayTime(c.last_message_at);
                  return (
                    <tr key={c.id}>
                      <td className="as-when">{when}</td>
                      <td className="as-first">{c.first_message ? <span>{c.first_message}</span> : <span className="note">{t.noFirst}</span>}</td>
                      <td className="num">{n(c.message_count)}</td>
                      <td>
                        <span className={chip[c.outcome] || "c-chip"}>{t.results[c.outcome] || c.outcome}</span>
                        {c.over_limit && <span className="note as-over-limit">{t.overLimit}</span>}
                      </td>
                      <td>
                        <Link className="link" href={`${base}/conversations/${c.id}`} aria-label={format(t.openLabel, { date: when })}>
                          {t.open}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="c-empty">
            <p>{q || filter ? t.emptyFilter : t.empty}</p>
          </div>
        )}
        {list.pages > 1 && (
          <nav className="as-pages" aria-label={t.pagesLabel}>
            {list.page > 1 ? (
              <Link className="btn btn--sm" href={href({ page: list.page - 1 })}>
                {t.newer}
              </Link>
            ) : (
              <span />
            )}
            <span className="note">{format(t.page, { page: n(list.page), pages: n(list.pages) })}</span>
            {list.page < list.pages ? (
              <Link className="btn btn--sm" href={href({ page: list.page + 1 })}>
                {t.older}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
        <p className="note" style={{ marginTop: 12 }}>
          {t.kept}
        </p>
      </section>
    </div>
  );
}

async function QuestionsPanel({ db, businessId, team }) {
  const t = copy.questions;
  const { list, total } = await openQuestions(db, businessId);
  return (
    <section className="c-card" aria-labelledby="as-q-h">
      <h2 id="as-q-h">{t.title}</h2>
      <p style={{ marginTop: 6 }}>{t.text}</p>
      {list.length ? (
        <ul className="c-list as-questions">
          {list.map((g, i) => {
            const text = g.text.slice(0, 300);
            return (
              <li key={g.key}>
                <Icon name="chat" />
                <span className="as-questions__text">
                  <b>{text}</b>
                  <span className="note">
                    {g.count === 1 ? t.askedOnce : format(t.asked, { count: n(g.count) })}, {format(t.last, { date: lagosDay(g.last) })}
                  </span>
                </span>
                <span className="as-questions__btn">
                  <AddAnswer questionKey={g.key} text={text} business={team ? businessId : undefined} n={i} />
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="note" style={{ marginTop: 12 }}>
          {t.empty}
        </p>
      )}
      {total > list.length && (
        <p className="note" style={{ marginTop: 12 }}>
          {format(t.more, { count: n(list.length) })}
        </p>
      )}
    </section>
  );
}

export default async function AssistView({ db, business, sp = {}, base, team = false }) {
  const tab = TABS.includes(sp.tab) ? sp.tab : "setup";
  let assistant = null;
  if (!team) {
    const { data } = await db.from("assistants").select("*").eq("business_id", business.id).maybeSingle();
    assistant = data;
  }
  if (!assistant) assistant = await ensureAssistant(business.id);
  if (!assistant) notFound();
  // The numbers load while the tab loads its own data, not before it.
  const stats = assistStats(db, assistant);
  stats.catch(() => {});
  const sites = Array.isArray(assistant.sites) ? assistant.sites : [];

  let panel = null;
  if (tab === "setup") {
    const initial = {
      name: assistant.name || "",
      sells: assistant.sells || "",
      prices: assistant.prices || "",
      hours: assistant.hours || "",
      areas: assistant.areas || "",
      whatsapp: assistant.whatsapp || "",
      phone: assistant.phone || "",
      email: assistant.email || "",
      qa: Array.isArray(assistant.qa) ? assistant.qa.map((p) => ({ q: String(p.q || ""), a: String(p.a || "") })) : [],
      extra: assistant.extra || "",
      greeting: assistant.greeting || "",
      starters: Array.isArray(assistant.starters) ? assistant.starters.map(String) : [],
      color: assistant.color,
      corner: assistant.corner === "left" ? "left" : "right",
      sites,
    };
    panel = <SetupForm initial={initial} business={team ? business.id : undefined} />;
  }
  if (tab === "test") panel = <TestPanel assistant={assistant} />;
  if (tab === "install") panel = <InstallPanel assistant={assistant} base={base} />;
  if (tab === "conversations") panel = <ConversationsPanel db={db} businessId={business.id} base={base} sp={sp} team={team} stats={stats} />;
  if (tab === "questions") panel = <QuestionsPanel db={db} businessId={business.id} team={team} />;

  return (
    <>
      <div className="c-head">
        <div>
          {team && (
            <p className="c-head__crumb">
              <Link className="link" href="/console/team/assistants">
                {copy.teamCrumb}
              </Link>
            </p>
          )}
          <div className="c-head__title">
            <Icon name="chat" />
            <h1>{team ? format(copy.teamTitle, { business: business.name }) : copy.title}</h1>
          </div>
          <p className="c-lede">{team ? copy.teamLede : copy.lede}</p>
        </div>
      </div>
      <div className={`as-controls${team ? " as-controls--team" : ""}`}>
        <AssistSwitch on={assistant.is_on} hasSites={sites.length > 0} business={team ? business.id : undefined} />
        {team && <LimitForm business={business.id} limit={assistant.monthly_limit} />}
      </div>
      <div className="c-sec">
        <Stats load={stats} />
      </div>
      <nav className="c-tabs c-sec" aria-label={copy.tabs.label}>
        {TABS.map((t) => (
          <Link key={t} href={t === "setup" ? base : `${base}?tab=${t}`} aria-current={t === tab ? "page" : undefined}>
            {copy.tabs[t]}
          </Link>
        ))}
      </nav>
      <div className="c-sec">{panel}</div>
    </>
  );
}
