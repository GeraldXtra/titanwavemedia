import TeamMembersPanel from "@/components/console/team/TeamMembersPanel";
import { teamContext } from "@/lib/console";
import { getAdmin } from "@/lib/supabase";
import copy from "@/content/console/team-members";

export const metadata = { title: copy.meta.title };

export default async function TeamMembersPage() {
  const ctx = await teamContext({ owner: true });
  const admin = getAdmin();
  const { data: rows } = await admin.from("team_members").select("id, email, user_id, created_at").order("created_at");
  const ids = (rows || []).map((r) => r.user_id).filter(Boolean);
  const [{ data: profiles }, { data: signedIn }] = ids.length
    ? await Promise.all([admin.from("profiles").select("user_id, full_name").in("user_id", ids), admin.from("signin_events").select("user_id").in("user_id", ids)])
    : [{ data: [] }, { data: [] }];
  const names = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));
  const joined = new Set((signedIn || []).map((s) => s.user_id));
  return (
    <>
      <div className="c-head">
        <div>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      <TeamMembersPanel
        owner={(ctx.profile.full_name || "").trim() || ctx.email}
        members={(rows || []).map((r) => ({ id: r.id, email: r.email, name: r.user_id ? names.get(r.user_id) || "" : "", joined: joined.has(r.user_id) }))}
      />
    </>
  );
}
