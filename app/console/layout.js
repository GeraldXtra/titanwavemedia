import "@/app/console.css";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import ConsoleShell from "@/components/console/ConsoleShell";
import { legalDocs } from "@/components/console/LegalTexts";
import { getContext } from "@/lib/auth";
import { getAdmin } from "@/lib/supabase";
import shell from "@/content/console/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: shell.title,
  robots: { index: false, follow: false },
};

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

  const admin = getAdmin();
  const [due, inbox] = await Promise.all([
    ctx.business ? admin.from("invoices").select("id", { count: "exact", head: true }).eq("business_id", ctx.business.id).eq("status", "due") : { count: 0 },
    ctx.isTeam ? admin.from("threads").select("id", { count: "exact", head: true }).eq("status", "new") : { count: 0 },
  ]);

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
    <ConsoleShell me={me} counts={{ due: due.count || 0, inbox: inbox.count || 0 }} legal={legalDocs()}>
      {children}
    </ConsoleShell>
  );
}
