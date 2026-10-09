import Link from "next/link";
import Icon from "@/components/Icon";
import Status from "@/components/console/Status";
import { clientContext, projectStatus, projectStatusKey, stepName } from "@/lib/console";
import { format } from "@/lib/text";
import copy from "@/content/console/projects";

export const metadata = { title: copy.meta.title };

export default async function ProjectsPage() {
  const ctx = await clientContext();
  const [{ data: projects }, { data: quotes }] = await Promise.all([
    ctx.supabase.from("projects").select("id, title, summary, step").order("created_at", { ascending: false }),
    ctx.supabase.from("quotes").select("project_id, status").eq("status", "sent"),
  ]);
  const waiting = new Set((quotes || []).map((q) => q.project_id));

  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
        <div className="btns">
          <Link className="btn btn--solid" href="/console/projects/new">
            <Icon name="plus" />
            {copy.start}
          </Link>
        </div>
      </div>
      {projects && projects.length ? (
        <div className="c-grid" style={{ "--n": 2 }}>
          {projects.map((p) => (
            <Link className="c-tile" key={p.id} href={`/console/projects/${p.id}`}>
              <Icon name="folder" />
              <h2 style={{ fontSize: 17 }}>{p.title}</h2>
              {p.summary && <p>{p.summary.slice(0, 160)}</p>}
              <div className="c-tile__foot">
                <span>{format(copy.stepOf, { n: p.step, step: stepName(p.step) })}</span>
                <Status kind="project" value={projectStatusKey(p, waiting.has(p.id) ? { status: "sent" } : null)} label={projectStatus(p, waiting.has(p.id) ? { status: "sent" } : null)} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="c-empty">
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyText}</p>
          <div className="btns">
            <Link className="btn" href="/console/projects/new">
              {copy.emptyButton}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
