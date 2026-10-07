import Link from "next/link";
import InviteClient from "@/components/console/team/InviteClient";
import { stepName, teamContext } from "@/lib/console";
import { naira } from "@/lib/format";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";
import copy from "@/content/console/team-clients";

export const metadata = { title: copy.meta.title };

export default async function TeamClientsPage() {
  await teamContext();
  const admin = getAdmin();
  const [businesses, owners, projects, invoices, payments] = await Promise.all([
    admin.from("businesses").select("id, name, created_at").order("created_at", { ascending: false }),
    admin.from("business_members").select("business_id, email, user_id, created_at").eq("role", "owner").order("created_at"),
    admin.from("projects").select("id, business_id, title, step, care_kobo, care_started_on, care_ended_on, created_at").order("created_at", { ascending: false }),
    admin.from("invoices").select("business_id, total_kobo, status").eq("status", "due"),
    admin.from("payments").select("business_id, amount_kobo, refunded_kobo").eq("status", "success"),
  ]);
  const ownerIds = (owners.data || []).map((o) => o.user_id).filter(Boolean);
  const { data: profiles } = ownerIds.length ? await admin.from("profiles").select("user_id, full_name").in("user_id", ownerIds) : { data: [] };
  const names = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));
  const t = copy.table;
  const rows = (businesses.data || []).map((b) => {
    const owner = (owners.data || []).find((o) => o.business_id === b.id);
    const mine = (projects.data || []).filter((p) => p.business_id === b.id);
    const paid = (payments.data || []).filter((p) => p.business_id === b.id).reduce((a, p) => a + Number(p.amount_kobo) - Number(p.refunded_kobo || 0), 0);
    const owed = (invoices.data || []).filter((i) => i.business_id === b.id).reduce((a, i) => a + Number(i.total_kobo), 0);
    const monthly = mine.filter((p) => p.care_started_on && !p.care_ended_on).reduce((a, p) => a + Number(p.care_kobo || 0), 0);
    return { b, owner, ownerName: owner && owner.user_id ? names.get(owner.user_id) : "", project: mine[0], more: mine.length - 1, paid, owed, monthly };
  });

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      {rows.length ? (
        <div className="c-tw">
          <table>
            <thead>
              <tr>
                <th>{t.client}</th>
                <th>{t.project}</th>
                <th>{t.stage}</th>
                <th className="num">{t.paid}</th>
                <th className="num">{t.owed}</th>
                <th className="num">{t.monthly}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.b.id}>
                  <td>
                    <b>{r.b.name}</b>
                    <br />
                    <span className="note">{r.ownerName || (r.owner ? r.owner.email : "")}</span>
                  </td>
                  <td>
                    {r.project ? (
                      <Link className="link" href={`/console/team/projects/${r.project.id}`}>
                        {r.project.title}
                      </Link>
                    ) : (
                      <span className="note">{t.noProject}</span>
                    )}
                    {r.more > 0 && <span className="note"> {format(t.more, { count: r.more })}</span>}
                  </td>
                  <td>{r.project ? format(t.stage_, { step: stepName(r.project.step), n: r.project.step }) : ""}</td>
                  <td className="num">{r.paid ? naira(r.paid) : <span className="note">{t.none}</span>}</td>
                  <td className="num">{r.owed ? naira(r.owed) : <span className="note">{t.nothing}</span>}</td>
                  <td className="num">{r.monthly ? naira(r.monthly) : <span className="note">{t.none}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="c-empty">
          <p>{t.empty}</p>
        </div>
      )}
      <div className="c-sec">
        <InviteClient />
      </div>
    </>
  );
}
