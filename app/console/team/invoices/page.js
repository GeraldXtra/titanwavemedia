import Link from "next/link";
import InvoiceBuilder from "@/components/console/team/InvoiceBuilder";
import { teamContext } from "@/lib/console";
import { lagosDay, naira } from "@/lib/format";
import { getAdmin } from "@/lib/supabase";
import copy from "@/content/console/team-invoices";
import billing from "@/content/console/billing";

export const metadata = { title: copy.meta.title };

export default async function TeamInvoicesPage() {
  await teamContext();
  const admin = getAdmin();
  const [businesses, owners, projects, invoices] = await Promise.all([
    admin.from("businesses").select("id, name, address").order("name"),
    admin.from("business_members").select("business_id, email, user_id").eq("role", "owner").order("created_at"),
    admin.from("projects").select("id, business_id, title").order("created_at", { ascending: false }),
    admin.from("invoices").select("number, billed_business, business_id, title, due_on, total_kobo, status").order("seq", { ascending: false }).limit(200),
  ]);
  const ids = (owners.data || []).map((o) => o.user_id).filter(Boolean);
  const { data: profiles } = ids.length ? await admin.from("profiles").select("user_id, full_name").in("user_id", ids) : { data: [] };
  const names = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));
  const clients = (businesses.data || []).map((b) => {
    const o = (owners.data || []).find((x) => x.business_id === b.id);
    return {
      id: b.id,
      name: b.name,
      address: b.address || "",
      contact: o && o.user_id ? names.get(o.user_id) || "" : "",
      email: o ? o.email : "",
      projects: (projects.data || []).filter((p) => p.business_id === b.id).map((p) => ({ id: p.id, title: p.title })),
    };
  });
  const a = copy.all;

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      <InvoiceBuilder clients={clients} />
      <section className="c-sec">
        <h2>{a.title}</h2>
        {invoices.data && invoices.data.length ? (
          <div className="c-tw">
            <table>
              <thead>
                <tr>
                  <th>{a.number}</th>
                  <th>{a.client}</th>
                  <th>{a.for}</th>
                  <th>{a.due}</th>
                  <th className="num">{a.amount}</th>
                  <th>{a.status}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.data.map((i) => (
                  <tr key={i.number}>
                    <td>
                      <Link className="link" href={`/console/invoices/${i.number}`}>
                        {i.number}
                      </Link>
                    </td>
                    <td>
                      {i.billed_business}
                      {!i.business_id && <span className="note"> ({a.deleted})</span>}
                    </td>
                    <td>{i.title}</td>
                    <td>{lagosDay(i.due_on)}</td>
                    <td className="num">{naira(i.total_kobo)}</td>
                    <td>
                      <span className={`c-chip${i.status === "paid" ? " c-chip--ok" : ""}`}>{billing.invoiceStatus[i.status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="c-empty">
            <p>{a.empty}</p>
          </div>
        )}
      </section>
    </>
  );
}
