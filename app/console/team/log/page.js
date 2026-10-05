import { teamContext } from "@/lib/console";
import { lagosDayTime } from "@/lib/format";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import copy from "@/content/console/team-log";

export const metadata = { title: copy.meta.title };

// What the team did, newest first: invoices sent, refunds, steps changed, members added.
export default async function TeamLogPage() {
  await teamContext();
  const { data: rows } = await getAdmin().from("audit_log").select("created_at, actor_email, action, target, details").order("created_at", { ascending: false }).limit(300);
  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      {rows && rows.length ? (
        <div className="c-tw">
          <table>
            <thead>
              <tr>
                <th>{copy.when}</th>
                <th>{copy.who}</th>
                <th>{copy.what}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{lagosDayTime(r.created_at)}</td>
                  <td>{r.actor_email}</td>
                  <td>{copy.actions[r.action] ? format(copy.actions[r.action], { target: r.target || "", ...(r.details || {}) }) : r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="c-empty">
          <p>{copy.empty}</p>
        </div>
      )}
    </>
  );
}
