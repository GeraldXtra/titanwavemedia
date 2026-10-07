import copy from "@/content/console/assist";
import { guard } from "@/lib/api";
import { assistAccess } from "@/lib/assist/consoleApi";
import { MAX_FILE, readDocument } from "@/lib/assist/documents";
import { json } from "@/lib/http";
import { keyHash } from "@/lib/security";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY = MAX_FILE + 256 * 1024;

async function readBody(request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY) return { error: "size" };
  if (!request.body) return { error: "invalid" };
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      return { error: "size" };
    }
    chunks.push(Buffer.from(value));
  }
  return { body: Buffer.concat(chunks) };
}

export async function POST(request) {
  const first = await guard(request);
  if (first.res) return first.res;
  const d = copy.setup.docs.errors;
  const type = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data/i.test(type)) return json({ ok: false, error: "invalid", message: d.read }, 400);
  const read = await readBody(request);
  if (read.error) return json({ ok: false, error: read.error, message: read.error === "size" ? d.size : d.read }, read.error === "size" ? 413 : 400);

  let form;
  try {
    form = await new Response(read.body, { headers: { "content-type": type } }).formData();
  } catch {
    return json({ ok: false, error: "invalid", message: d.read }, 400);
  }
  const business = form.get("business");
  const access = await assistAccess(request, typeof business === "string" && business ? { business } : {});
  if (access.res) return access.res;

  const file = form.get("file");
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") return json({ ok: false, error: "invalid", message: d.read }, 400);
  if (file.size > MAX_FILE) return json({ ok: false, error: "size", message: d.size }, 413);

  const { data: limit, error: limitError } = await getAdmin().rpc("rate_take", {
    p_bucket: "assistDoc",
    p_key: keyHash(`assistDoc:${access.ctx.user.id}`),
    p_limit: 30,
    p_window_seconds: 3600,
  });
  if (limitError) {
    console.error("[assist console] document limit:", limitError.message);
    return json({ ok: false, error: "failed", message: copy.failed }, 502);
  }
  if (!limit || !limit.ok) return json({ ok: false, error: "limit", message: d.limit }, 429, { "Retry-After": String((limit && limit.retry_after) || 3600) });

  const result = await readDocument(file.name, Buffer.from(await file.arrayBuffer()));
  if (!result.ok) return json({ ok: false, error: result.error, message: d[result.error] || d.read }, 422);
  return json({ ok: true, name: result.name, kind: result.kind, text: result.text, chars: result.text.length, cut: result.cut });
}
