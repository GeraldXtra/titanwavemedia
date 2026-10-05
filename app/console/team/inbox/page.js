import InboxView from "@/components/console/team/InboxView";
import { teamContext } from "@/lib/console";
import { listInbox, threadDetail } from "@/lib/inbox";
import copy from "@/content/console/team-inbox";

export const metadata = { title: copy.meta.title };

export default async function TeamInboxPage({ searchParams }) {
  const sp = await searchParams;
  const ctx = await teamContext();
  const [items, selected] = await Promise.all([listInbox("all"), sp.item ? threadDetail(sp.item, ctx) : null]);
  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      <InboxView items={items} selected={selected} />
    </>
  );
}
