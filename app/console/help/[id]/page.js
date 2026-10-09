import Link from "next/link";
import { notFound } from "next/navigation";
import Chat from "@/components/console/Chat";
import Status from "@/components/console/Status";
import { clientContext } from "@/lib/console";
import { lagosDay } from "@/lib/format";
import { format } from "@/lib/text";
import { loadMessages, shapeMessages } from "@/lib/threads";
import copy from "@/content/console/help";

export const metadata = { title: copy.meta.title };

export default async function TicketPage({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const ctx = await clientContext();
  const { data: t } = await ctx.supabase.from("threads").select("id, subject, status, created_at").eq("id", id).eq("kind", "help").maybeSingle();
  if (!t) notFound();
  const messages = shapeMessages(await loadMessages(t.id), { viewer: "client", userId: ctx.user.id, you: copy.ticket.you });
  return (
    <>
      <div className="c-head">
        <div>
          <p className="c-head__crumb">
            <Link className="link" href="/console/help">
              {copy.ticket.crumb}
            </Link>
          </p>
          <h1>{t.subject}</h1>
          <p className="c-lede">{format(copy.ticket.opened, { date: lagosDay(t.created_at) })}</p>
        </div>
        <Status kind="help" value={t.status} label={copy.status[t.status]} />
      </div>
      {t.status === "solved" && (
        <p className="c-card" style={{ marginBottom: 12 }}>
          {copy.ticket.solvedNote}
        </p>
      )}
      <div style={{ maxWidth: 820 }}>
        <Chat
          title={t.subject}
          url={`/api/console/help/${t.id}`}
          initial={messages}
          words={{ label: copy.ticket.label, placeholder: copy.ticket.placeholder, send: copy.ticket.send, empty: "", failed: copy.ticket.failed }}
          inputId="hp-reply"
        />
      </div>
    </>
  );
}
