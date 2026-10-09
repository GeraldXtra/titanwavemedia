import { createHash, timingSafeEqual } from "node:crypto";
import { json } from "@/lib/http";
import { logMissing, missingSettings, setting } from "@/lib/settings.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const digest = (text) => createHash("sha256").update(String(text)).digest();

function notFound() {
  return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" } });
}

export function GET(request) {
  const secret = setting("CRON_SECRET");
  const header = (request.headers.get("authorization") || "").trim();
  const given = /^bearer\s+/i.test(header) ? header.replace(/^bearer\s+/i, "").trim() : "";
  if (!secret || !given || !timingSafeEqual(digest(given), digest(secret))) return notFound();
  const missing = missingSettings();
  logMissing(missing);
  return json(missing.length ? { ready: false, missing } : { ready: true });
}
