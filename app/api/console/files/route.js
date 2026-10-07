import { randomUUID } from "node:crypto";
import copy from "@/content/console/project";
import { guard } from "@/lib/api";
import { addActivity, notifyBusiness, notifyTeam } from "@/lib/events";
import { MAX_FILE_BYTES, fileType, storageName } from "@/lib/files";
import { json, readJson, str } from "@/lib/http";
import { projectAccess } from "@/lib/projects";
import { getAdmin } from "@/lib/supabase";
import { format } from "@/lib/text";

export const runtime = "nodejs";
const BUCKET = "project-files";

const pathFor = (project, fileId, name) => `${project.business_id}/${project.id}/${fileId}/${storageName(name)}`;

export async function POST(request) {
  const { ctx, res } = await guard(request);
  if (res) return res;
  const body = await readJson(request, 4 * 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  const access = await projectAccess(ctx, data.projectId);
  if (!access) return json({ ok: false, error: "not_found" }, 404);
  const { project, side } = access;
  const name = str(data.name).trim().slice(0, 200);
  const type = fileType(name);
  if (!name || !type) return json({ ok: false, message: format(copy.files.wrongType, { name: name || "" }) }, 400);
  const admin = getAdmin();

  if (data.action === "start") {
    const size = Number(data.size);
    if (!Number.isFinite(size) || size < 1 || size > MAX_FILE_BYTES) return json({ ok: false, message: format(copy.files.tooBig, { name }) }, 400);
    const fileId = randomUUID();
    const { data: signed, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(pathFor(project, fileId, name));
    if (error || !signed) {
      console.error("[files] upload link:", error && error.message);
      return json({ ok: false, message: format(copy.files.failed, { name }) }, 502);
    }
    return json({ ok: true, url: signed.signedUrl, fileId, contentType: type });
  }

  if (data.action === "done") {
    const fileId = str(data.fileId);
    if (!/^[0-9a-f-]{36}$/i.test(fileId)) return json({ ok: false, error: "bad_file" }, 400);
    const path = pathFor(project, fileId, name);
    const { data: info, error } = await admin.storage.from(BUCKET).info(path);
    const size = info ? Number(info.size || (info.metadata && info.metadata.size)) : 0;
    const mime = info ? String(info.contentType || (info.metadata && info.metadata.mimetype) || "").split(";")[0] : "";
    if (error || !info || !size || size > MAX_FILE_BYTES || mime !== type) {
      if (info) await admin.storage.from(BUCKET).remove([path]);
      return json({ ok: false, message: format(copy.files.failed, { name }) }, 400);
    }
    const fromTeam = side === "team";
    const { error: rowError } = await admin
      .from("project_files")
      .insert({ id: fileId, project_id: project.id, business_id: project.business_id, path, name, size_bytes: size, mime: type, from_team: fromTeam, uploaded_by: ctx.user.id });
    if (rowError) {
      if (rowError.code === "23505") return json({ ok: true });
      console.error("[files] save:", rowError.message);
      return json({ ok: false, message: format(copy.files.failed, { name }) }, 502);
    }
    await admin.from("project_updates").insert({ project_id: project.id, business_id: project.business_id, kind: "file", data: { name, team: fromTeam }, created_by: ctx.user.id });
    if (fromTeam) {
      await addActivity(project.business_id, ctx.user.id, "file_team", { project: project.title, name });
      await notifyBusiness(project.business_id, "file_team", { project: project.title, name }, `/console/projects/${project.id}`);
    } else {
      await addActivity(project.business_id, ctx.user.id, "file_sent", { name });
      await notifyTeam("file_client", { business: ctx.business.name, name }, `/console/team/projects/${project.id}`, { except: ctx.user.id });
    }
    return json({ ok: true });
  }

  return json({ ok: false, error: "bad_action" }, 400);
}
