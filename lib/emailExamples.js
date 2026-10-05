import "server-only";
import { getAdmin } from "./supabase";
import { lagosDay, lagosDayTime, naira } from "./format";
import { methodLabel } from "./payments";
import { siteUrl } from "./seo";
import { format } from "./text";
import copy from "@/content/console/team-emails";
import teamMembers from "@/content/console/team-members";

// The Team view's Emails page: each email filled with the newest real example of what sends
// it, or with blanks when nothing has sent it yet. Returns { to, data, url, what } or a blank.

const G = copy.gap;
const first = (name) => String(name || "").trim().split(/\s+/)[0] || G;

export async function emailExample(key) {
  const admin = getAdmin();
  const one = async (q) => (await q.limit(1).maybeSingle()).data;
  const blank = (data, url = `${siteUrl}/console`) => ({ to: G, data, url, what: null });

  switch (key) {
    case "signin": {
      const l = await one(admin.from("auth_links").select("email, created_at").order("created_at", { ascending: false }));
      const data = { email: l ? l.email : G, device: G, time: l ? lagosDayTime(l.created_at) : G };
      return l ? { to: l.email, data, url: `${siteUrl}/auth/confirm?token_hash=${G}`, what: copy.examples.signin } : blank(data, `${siteUrl}/auth/confirm?token_hash=${G}`);
    }
    case "welcome": {
      const b = await one(admin.from("businesses").select("id, name").order("created_at", { ascending: false }));
      if (!b) return blank({ first: G, business: G });
      const m = await one(admin.from("business_members").select("email, user_id").eq("business_id", b.id).eq("role", "owner"));
      const p = m && m.user_id ? await one(admin.from("profiles").select("full_name").eq("user_id", m.user_id)) : null;
      return { to: m ? m.email : G, data: { first: first(p && p.full_name), business: b.name }, url: `${siteUrl}/console`, what: copy.examples.welcome };
    }
    case "invoice":
    case "reminder": {
      let q = admin.from("invoices").select("*").not("business_id", "is", null);
      q = key === "reminder" ? q.not("last_reminder_at", "is", null).order("last_reminder_at", { ascending: false }) : q.order("issued_at", { ascending: false });
      const i = await one(q);
      const data = i ? { first: first(i.billed_name), number: i.number, title: i.title, amount: naira(i.total_kobo), due: lagosDay(i.due_on) } : { first: G, number: G, title: G, amount: G, due: G };
      return i ? { to: i.billed_email || G, data, url: `${siteUrl}/console/invoices/${i.number}`, what: format(copy.examples[key], { number: i.number }) } : blank(data);
    }
    case "receipt": {
      const r = await one(admin.from("receipts").select("*, payments(*), invoices(title, billed_name, billed_email)").order("created_at", { ascending: false }));
      if (!r) return blank({ first: G, amount: G, title: G, number: G, date: G, method: G, reference: G });
      return {
        to: r.invoices.billed_email || G,
        data: { first: first(r.invoices.billed_name), amount: naira(r.amount_kobo), title: r.invoices.title, number: r.number, date: lagosDay(r.paid_at), method: methodLabel(r.payments), reference: r.payments.reference },
        url: `${siteUrl}/console/receipts/${r.number}`,
        what: format(copy.examples.receipt, { number: r.number }),
      };
    }
    case "failed": {
      const p = await one(admin.from("payments").select("*, invoices(number, billed_name, billed_email)").eq("status", "failed").order("created_at", { ascending: false }));
      if (!p) return blank({ first: G, amount: G, number: G, method: G });
      return { to: p.invoices.billed_email || G, data: { first: first(p.invoices.billed_name), amount: naira(p.amount_kobo), number: p.invoices.number, method: methodLabel(p) }, url: `${siteUrl}/console/invoices/${p.invoices.number}`, what: copy.examples.failed };
    }
    case "project_message":
    case "reply": {
      const kinds = key === "project_message" ? ["project"] : ["contact", "quote", "help", "refund", "feedback"];
      const m = await one(admin.from("thread_messages").select("body, author_name, created_at, threads!inner(kind, subject, from_name, from_email, project_id)").eq("from_team", true).in("threads.kind", kinds).order("created_at", { ascending: false }));
      if (!m) return blank(key === "project_message" ? { first: G, who: G, project: G, text: G } : { first: G, who: G, text: G });
      const data = { first: first(m.threads.from_name), who: first(m.author_name), text: m.body, project: m.threads.subject };
      return { to: m.threads.from_email || G, data, url: key === "project_message" ? `${siteUrl}/console/projects/${m.threads.project_id}` : `${siteUrl}/console`, what: copy.examples[key] };
    }
    case "refund_requested":
    case "refund_sent": {
      let q = admin.from("refund_requests").select("*, receipts(number, invoices(title, billed_name, billed_email)), payments(reference)");
      q = key === "refund_sent" ? q.eq("status", "refunded").order("refunded_at", { ascending: false }) : q.order("created_at", { ascending: false });
      const r = await one(q);
      if (!r) return blank({ first: G, amount: G, title: G, number: G, reason: G, reference: G });
      const inv = r.receipts.invoices;
      return {
        to: inv.billed_email || G,
        data: { first: first(inv.billed_name), amount: naira(r.refunded_kobo || r.amount_kobo), title: inv.title, number: r.receipts.number, reason: r.reason, reference: r.payments.reference },
        url: `${siteUrl}/console/receipts/${r.receipts.number}`,
        what: copy.examples[key],
      };
    }
    case "team_invite": {
      const [m, t] = await Promise.all([
        one(admin.from("business_members").select("email, created_at, invited_by, businesses(name)").not("invited_by", "is", null).order("created_at", { ascending: false })),
        one(admin.from("team_members").select("email, created_at, added_by").order("created_at", { ascending: false })),
      ]);
      const pick = m && (!t || m.created_at > t.created_at) ? { email: m.email, by: m.invited_by, team: m.businesses ? m.businesses.name : G } : t ? { email: t.email, by: t.added_by, team: teamMembers.teamName } : null;
      if (!pick) return blank({ inviter: G, team: G, email: G, signin: `${siteUrl}/signin` }, `${siteUrl}/auth/confirm?token_hash=${G}`);
      const p = pick.by ? await one(admin.from("profiles").select("full_name, email").eq("user_id", pick.by)) : null;
      return { to: pick.email, data: { inviter: (p && (p.full_name || p.email)) || G, team: pick.team, email: pick.email, signin: `${siteUrl}/signin` }, url: `${siteUrl}/auth/confirm?token_hash=${G}`, what: copy.examples.team_invite };
    }
    case "twostep_removed": {
      const s = await one(admin.from("signin_events").select("user_id, created_at").in("method", ["link_backup", "google_backup"]).order("created_at", { ascending: false }));
      if (!s) return blank({ first: G, time: G }, `${siteUrl}/console/settings?tab=security`);
      const p = await one(admin.from("profiles").select("full_name, email").eq("user_id", s.user_id));
      return { to: p ? p.email : G, data: { first: first(p && p.full_name), time: lagosDayTime(s.created_at) }, url: `${siteUrl}/console/settings?tab=security`, what: copy.examples.twostep_removed };
    }
    default:
      return blank({});
  }
}

