import Link from "next/link";
import { ProfileForm, BusinessForm } from "@/components/console/settings/ProfileForms";
import TwoStep from "@/components/console/settings/TwoStep";
import EmailPrefs from "@/components/console/settings/EmailPrefs";
import TeamPanel from "@/components/console/settings/TeamPanel";
import DataPanel from "@/components/console/settings/DataPanel";
import { clientContext } from "@/lib/console";
import { lagosDayTime } from "@/lib/format";
import { getAdmin } from "@/lib/supabase";
import copy from "@/content/console/settings";

export const metadata = { title: copy.meta.title };

const TABS = ["profile", "security", "notifications", "team", "data"];

export default async function SettingsPage({ searchParams }) {
  const sp = await searchParams;
  const tab = TABS.includes(sp.tab) ? sp.tab : "profile";
  const ctx = await clientContext();
  const owner = ctx.role === "owner";
  const biz = ctx.business;

  let panel = null;
  if (tab === "profile") {
    panel = (
      <div className="c-stack" style={{ maxWidth: 720 }}>
        <ProfileForm name={ctx.profile.full_name || ""} email={ctx.email} />
        <BusinessForm business={{ name: biz.name, phone: biz.phone || "", address: biz.address || "" }} owner={owner} />
      </div>
    );
  }
  if (tab === "security") {
    const { data: history } = await ctx.supabase.from("signin_events").select("created_at, method, browser, device").order("created_at", { ascending: false }).limit(20);
    const h = copy.security.history;
    panel = (
      <>
        <div className="c-split">
          <TwoStep on={ctx.twoStep} />
          <div className="c-card">
            <h2>{copy.security.devices.title}</h2>
            <p style={{ marginTop: 6 }}>{copy.security.devices.text}</p>
            <form action="/auth/signout" method="post" style={{ marginTop: 14 }}>
              <input type="hidden" name="all" value="1" />
              <button className="btn" type="submit">
                {copy.security.devices.button}
              </button>
            </form>
          </div>
        </div>
        <section className="c-sec c-card">
          <h2>{h.title}</h2>
          <p className="note">{h.help}</p>
          {history && history.length ? (
            <div className="c-tw" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th>{h.when}</th>
                    <th>{h.how}</th>
                    <th>{h.device}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((s, i) => (
                    <tr key={i}>
                      <td>{lagosDayTime(s.created_at)}</td>
                      <td>{h.methods[s.method] || s.method}</td>
                      <td>{[s.browser, s.device].filter(Boolean).join(", ") || h.unknown}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ marginTop: 6 }}>{h.empty}</p>
          )}
        </section>
      </>
    );
  }
  if (tab === "notifications") {
    const p = ctx.profile;
    panel = <EmailPrefs prefs={{ notify_projects: p.notify_projects !== false, notify_billing: p.notify_billing !== false, notify_news: p.notify_news === true }} />;
  }
  if (tab === "team") {
    const { data: members } = await getAdmin().from("business_members").select("id, email, role, joined_at, user_id").eq("business_id", biz.id).order("created_at");
    const ids = (members || []).map((m) => m.user_id).filter(Boolean);
    const { data: profiles } = ids.length ? await getAdmin().from("profiles").select("user_id, full_name").in("user_id", ids) : { data: [] };
    const names = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));
    panel = (
      <TeamPanel
        owner={owner}
        business={biz.name}
        me={ctx.user.id}
        members={(members || []).map((m) => ({ id: m.id, email: m.email, role: m.role, name: names.get(m.user_id) || "", waiting: !m.joined_at, mine: m.user_id === ctx.user.id }))}
      />
    );
  }
  if (tab === "data") {
    const { count } = await getAdmin().from("invoices").select("id", { count: "exact", head: true }).eq("business_id", biz.id).eq("status", "due");
    panel = <DataPanel owner={owner} business={biz.name} unpaid={(count || 0) > 0} />;
  }

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      <nav className="c-tabs" aria-label={copy.title}>
        {TABS.map((t) => (
          <Link key={t} href={t === "profile" ? "/console/settings" : `/console/settings?tab=${t}`} aria-current={t === tab ? "page" : undefined}>
            {copy.tabs[t]}
          </Link>
        ))}
      </nav>
      <div className="c-sec">{panel}</div>
    </>
  );
}
