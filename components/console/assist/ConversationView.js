import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteConversation, MarkHandled } from "./AssistActions";
import Status from "../Status";
import { loadConversationView } from "@/lib/assist/console";
import { isUuid } from "@/lib/assist/consoleApi";
import { lagosDayTime } from "@/lib/format";
import { format } from "@/lib/text";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/assist";

const linkableEmail = (e) => isEmail(e) && !/[?&#\s]/.test(e);

export default async function ConversationView({ db, business, id, base, team = false, canDelete = false }) {
  if (!isUuid(id)) notFound();
  const view = await loadConversationView(db, business.id, id);
  if (!view) notFound();
  const { conversation: c, messages, handovers } = view;
  const t = copy.conversation;
  const r = copy.conversations;
  const back = `${base}?tab=conversations`;
  const forTeam = team ? business.id : undefined;

  return (
    <>
      <div className="c-head">
        <div>
          <p className="c-head__crumb">
            <Link className="link" href={back}>
              {t.crumb}
            </Link>
          </p>
          <h1>{t.title}</h1>
          <p className="c-lede">{format(t.started, { date: lagosDayTime(c.created_at) })}</p>
        </div>
        <Status kind="outcome" value={c.outcome} label={r.results[c.outcome] || c.outcome} />
      </div>

      <div className="c-split">
        <section className="c-card" aria-labelledby="as-log-h">
          <h2 id="as-log-h" className="sr-only">
            {t.title}
          </h2>
          {c.over_limit && <p className="as-warn">{t.overLimit}</p>}
          <ol className="as-log">
            {messages.map((m) => {
              const mine = m.role === "customer";
              return (
                <li key={m.id} className={`c-msg ${mine ? "c-msg--in" : "c-msg--out"}`}>
                  <span className="as-log__who">
                    {mine ? t.customer : t.assistant}
                    <time dateTime={m.created_at}>{lagosDayTime(m.created_at)}</time>
                  </span>
                  {m.body}
                  {mine && m.answered === false && <small>{t.couldnt}</small>}
                  {!mine && m.handover && <small>{t.offered}</small>}
                </li>
              );
            })}
          </ol>
          {c.whatsapp_at && <p className="note">{format(t.whatsapp, { date: lagosDayTime(c.whatsapp_at) })}</p>}
          {c.ended_at && <p className="note">{t.ended}</p>}
        </section>

        <div className="c-stack">
          <section className="c-card" aria-labelledby="as-details-h">
            <h2 id="as-details-h">{t.details}</h2>
            {handovers.length ? (
              <ul className="as-handovers">
                {handovers.map((h) => (
                  <li key={h.id}>
                    <div className="c-row">
                      <b>{h.name}</b>
                      <Status kind="handover" value={h.handled_at ? "handled" : "waiting"} label={h.handled_at ? format(t.handledOn, { date: lagosDayTime(h.handled_at) }) : t.waiting} />
                    </div>
                    <dl className="as-dl">
                      <dt>{r.phone}</dt>
                      <dd>
                        {h.phone ? (
                          <a className="link" href={`tel:${h.phone.replace(/[^\d+]/g, "")}`}>
                            {h.phone}
                          </a>
                        ) : (
                          r.notGiven
                        )}
                      </dd>
                      <dt>{r.email}</dt>
                      <dd>
                        {h.email && linkableEmail(h.email) ? (
                          <a className="link" href={`mailto:${h.email}`}>
                            {h.email}
                          </a>
                        ) : (
                          h.email || r.notGiven
                        )}
                      </dd>
                      <dt>{r.question}</dt>
                      <dd>{h.question || r.notGiven}</dd>
                    </dl>
                    <p className="note">{format(r.left, { date: lagosDayTime(h.created_at) })}</p>
                    {!h.handled_at && (
                      <div className="btns" style={{ marginTop: 10 }}>
                        <MarkHandled id={h.id} business={forTeam} label={`${r.handled}: ${h.name}`} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ marginTop: 6 }}>{t.noDetails}</p>
            )}
          </section>

          <section className="c-card" aria-labelledby="as-delete-h">
            <h2 id="as-delete-h">{t.delete}</h2>
            <p style={{ marginTop: 6 }}>{t.kept}</p>
            {canDelete ? (
              <div className="btns" style={{ marginTop: 12 }}>
                <DeleteConversation id={c.id} business={forTeam} back={back} />
              </div>
            ) : (
              <p className="note" style={{ marginTop: 10 }}>
                {format(t.ownerOnly, { business: business.name })}
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
