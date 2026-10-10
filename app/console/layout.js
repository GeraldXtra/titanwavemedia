import "@/app/console.css";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import ConsoleShell from "@/components/console/ConsoleShell";
import { legalDocs } from "@/components/console/LegalTexts";
import { getContext } from "@/lib/auth";
import { PATH_HEADER } from "@/lib/sessionPass";
import { getAdmin } from "@/lib/supabase";
import shell from "@/content/console/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: shell.title,
  robots: { index: false, follow: false },
};

function pageGuard(path, ctx) {
  if (!path || !path.startsWith("/console")) return null;
  const under = (base) => path === base || path.startsWith(`${base}/`);
  if (path === "/console/start") return ctx.business ? "/console" : null;
  if (under("/console/team/members")) return ctx.isTeam && ctx.isOwner ? null : "/console";
  if (under("/console/team")) return ctx.isTeam ? null : "/console";
  if (under("/console/invoices") || under("/console/receipts")) return null;
  return ctx.business ? null : "/console/start";
}

export default async function ConsoleLayout({ children }) {
  const ctx = await getContext();
  if (!ctx.ready) {
    return (
      <AuthShell>
        <NotSwitchedOn />
      </AuthShell>
    );
  }
  if (!ctx.user) redirect("/signin");
  if (ctx.needsCode) redirect("/signin/code");
  const guard = pageGuard((await headers()).get(PATH_HEADER), ctx);
  if (guard) redirect(guard);

  const admin = getAdmin();
  const counts = Promise.all([
    ctx.business ? admin.from("invoices").select("id", { count: "exact", head: true }).eq("business_id", ctx.business.id).eq("status", "due") : { count: 0 },
    ctx.isTeam ? admin.from("threads").select("id", { count: "exact", head: true }).eq("status", "new") : { count: 0 },
  ]).then(
    ([due, inbox]) => ({ due: due.count || 0, inbox: inbox.count || 0 }),
    () => ({ due: 0, inbox: 0 })
  );

  const name = (ctx.profile.full_name || "").trim();
  const initials = (name || ctx.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const me = {
    name,
    email: ctx.email,
    initials,
    business: ctx.business ? ctx.business.name : null,
    role: ctx.role,
    isTeam: ctx.isTeam,
    isOwner: ctx.isOwner,
  };

  return (
    <ConsoleShell me={me} counts={counts} legal={legalDocs()}>
      {children}
    </ConsoleShell>
  );
}
