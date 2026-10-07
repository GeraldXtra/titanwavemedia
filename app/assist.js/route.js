import { siteUrl } from "@/lib/seo";
import { LOADER } from "./loader";

export const dynamic = "force-static";

function siteOrigin() {
  try {
    return new URL(siteUrl).origin;
  } catch {
    return "";
  }
}

const SCRIPT = LOADER.replace("__TWM_SITE__", JSON.stringify(siteOrigin()));

export function GET() {
  return new Response(SCRIPT, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
