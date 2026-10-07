import Link from "next/link";
import { redirect } from "next/navigation";
import StartForm from "@/components/console/StartForm";
import { getContext } from "@/lib/auth";
import copy from "@/content/console/start";

export const metadata = { title: copy.meta.title };

export default async function StartPage() {
  const ctx = await getContext();
  if (!ctx.user) redirect("/signin");
  if (ctx.business) redirect("/console");
  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      {ctx.isTeam && (
        <div className="c-card" style={{ maxWidth: 720, marginBottom: 12 }}>
          <h2>{copy.team.title}</h2>
          <p style={{ marginTop: 6 }}>{copy.team.text}</p>
          <div className="btns" style={{ marginTop: 12 }}>
            <Link className="btn" href="/console/team/inbox">
              {copy.team.back}
            </Link>
          </div>
        </div>
      )}
      <StartForm name={ctx.profile.full_name || ""} />
    </>
  );
}
