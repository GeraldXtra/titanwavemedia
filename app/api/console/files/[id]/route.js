import { NextResponse } from "next/server";
import { guard } from "@/lib/api";
import { json } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Downloads a project file: a signed link that works for 60 seconds, made only for members of
// the file's business and for our team.
export async function GET(request, { params }) {
  const { id } = await params;
  const { ctx, res } = await guard(request, { write: false });
  if (res) return res;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ ok: false, error: "not_found" }, 404);
  const admin = getAdmin();
  const { data: file } = await admin.from("project_files").select("path, name, business_id").eq("id", id).maybeSingle();
  const allowed = file && ((ctx.business && ctx.business.id === file.business_id) || ctx.isTeam);
  if (!allowed) return json({ ok: false, error: "not_found" }, 404);
  const { data, error } = await admin.storage.from("project-files").createSignedUrl(file.path, 60, { download: file.name });
  if (error || !data) return json({ ok: false, error: "failed" }, 502);
  return NextResponse.redirect(data.signedUrl, { status: 303, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
