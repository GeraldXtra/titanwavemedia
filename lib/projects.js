import "server-only";
import { getAdmin } from "./supabase";

// A project and whether the person may work on it: as a member of its business ("client"),
// or as our team ("team"). Returns { project, side } or null.
export async function projectAccess(ctx, projectId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(projectId || ""))) return null;
  const { data: project } = await getAdmin().from("projects").select("*").eq("id", projectId).maybeSingle();
  if (!project) return null;
  if (ctx.business && ctx.business.id === project.business_id) return { project, side: "client" };
  if (ctx.isTeam) return { project, side: "team" };
  return null;
}
