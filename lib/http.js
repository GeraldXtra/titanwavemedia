import "server-only";

// Small helpers shared by the API routes.

export function json(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

// The visitor's address as Vercel (or any proxy) reports it.
export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// Reads a JSON body, refusing anything larger than `max` bytes without reading the rest.
// Returns { data } or { error: "too_large" | "bad_json" }.
export async function readJson(request, max) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > max) return { error: "too_large" };
  if (!request.body) return { error: "bad_json" };
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return { error: "too_large" };
    }
    chunks.push(value);
  }
  try {
    const text = new TextDecoder().decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
    return { data: JSON.parse(text) };
  } catch {
    return { error: "bad_json" };
  }
}

export const str = (v) => (typeof v === "string" ? v : "");
