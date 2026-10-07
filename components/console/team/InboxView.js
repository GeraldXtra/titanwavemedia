"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Chat from "../Chat";
import Dialog from "../Dialog";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/team-inbox";

const FILTERS = ["all", "new", "replied"];

export default function InboxView({ items: firstItems, selected: firstSelected }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(firstItems);
  const [item, setItem] = useState(firstSelected);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadList = useCallback(async () => {
    if (document.hidden) return;
    try {
      const res = await fetch(`/api/console/team/threads/list?filter=${filter}`, { cache: "no-store" });
      if (res.ok) setItems((await res.json()).items || []);
    } catch {}
  }, [filter]);

  useEffect(() => {
    loadList();
    const id = setInterval(loadList, 15000);
    return () => clearInterval(id);
  }, [loadList]);

  async function open(id) {
    const res = await fetch(`/api/console/team/threads/${id}`, { cache: "no-store" });
    if (!res.ok) return;
    setItem(await res.json());
    router.replace(`/console/team/inbox?item=${id}`, { scroll: false });
  }

  async function act(action) {
    setBusy(true);
    const { data } = await postJson(`/api/console/team/threads/${item.id}/action`, { action });
    setBusy(false);
    setConfirm(null);
    toast(data.message || copy.reply.failed);
    if (data.ok) {
      open(item.id);
      loadList();
    }
  }

  const chip = (status) => <span className={`c-chip${status === "new" ? " c-chip--solid" : " c-chip--grey"}`}>{copy.status[status]}</span>;
  const r = copy.refund;

  return (
    <>
      <div className="c-row" style={{ marginBottom: 12 }}>
        <div className="c-filter" role="group" aria-label={copy.filter}>
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f ? "true" : "false"} onClick={() => setFilter(f)}>
              {copy.filters[f]}
            </button>
          ))}
        </div>
      </div>
      <div className="c-inbox">
        <ul className="c-inbox__list" aria-label={copy.title}>
          {items.length ? (
            items.map((i) => (
              <li key={i.id}>
                <button type="button" aria-current={item && item.id === i.id ? "true" : undefined} onClick={() => open(i.id)}>
                  <span className="c-row">
                    <b>{i.who}</b>
                    <time>{i.when}</time>
                  </span>
                  <span className="c-row" style={{ marginTop: 2 }}>
                    <span className="note">{i.label}</span>
                    {chip(i.status)}
                  </span>
                  <p>{i.last}</p>
                </button>
              </li>
            ))
          ) : (
            <li className="note" style={{ padding: 14 }}>
              {filter === "all" ? copy.emptyAll : copy.empty}
            </li>
          )}
        </ul>
        {item ? (
          <Chat
            key={item.id}
            title={item.who}
            sub={item.label}
            chip={chip(item.status)}
            url={`/api/console/team/threads/${item.id}`}
            initial={item.messages}
            inputId="ib-in"
            quick={copy.reply.quick}
            after={() => {
              toast(item.kind === "project" ? copy.reply.sentProject : copy.reply.sentEmail);
              loadList();
            }}
            words={{ label: copy.reply.label, placeholder: copy.reply.placeholder, send: copy.reply.send, empty: copy.reply.empty, failed: copy.reply.failed }}
            top={
              <>
                {item.details.length > 0 && (
                  <div className="c-details">
                    {item.details.map(([k, v]) => (
                      <span key={k}>
                        <span className="note">{k}:</span> <b>{v}</b>
                        <br />
                      </span>
                    ))}
                  </div>
                )}
                {(item.projectId || item.kind === "help" || item.refund) && (
                  <div className="c-details btns">
                    {item.projectId && (
                      <Link className="btn btn--sm" href={`/console/team/projects/${item.projectId}`}>
                        {copy.open}
                      </Link>
                    )}
                    {item.kind === "help" && item.status !== "solved" && (
                      <button className="btn btn--sm" type="button" disabled={busy} onClick={() => act("solve")}>
                        {copy.solve}
                      </button>
                    )}
                    {item.refund && (
                      <>
                        <span className="c-chip">{r.states[item.refund.status]}</span>
                        {item.refund.status === "requested" && (
                          <>
                            <button className="btn btn--sm btn--solid" type="button" disabled={busy} onClick={() => setConfirm("approve")}>
                              {format(r.approve, { amount: item.refund.amount })}
                            </button>
                            <button className="btn btn--sm" type="button" disabled={busy} onClick={() => setConfirm("decline")}>
                              {r.decline}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            }
          />
        ) : (
          <div className="c-empty">
            <h2>{copy.pick}</h2>
            <p>{copy.pickText}</p>
          </div>
        )}
      </div>
      {item && item.refund && (
        <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} title={confirm === "approve" ? format(r.approveTitle, { amount: item.refund.amount }) : r.declineTitle} labelId="rf-confirm">
          <p>{confirm === "approve" ? format(r.approveText, { amount: item.refund.amount, business: item.business || item.who }) : r.declineText}</p>
          <div className="btns" style={{ marginTop: 14 }}>
            <button className={`btn ${confirm === "approve" ? "btn--solid" : "btn--danger"}`} type="button" disabled={busy} onClick={() => act(confirm)}>
              {confirm === "approve" ? format(r.approveButton, { amount: item.refund.amount }) : r.declineButton}
            </button>
            <button className="btn" type="button" onClick={() => setConfirm(null)}>
              {r.cancel}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
