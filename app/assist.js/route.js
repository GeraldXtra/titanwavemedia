import { LOADER } from "./loader";

// The Wave Assist script businesses add to their websites (see loader.js). It is the same for
// everyone, so it is made once when the site is built.
export const dynamic = "force-static";

export function GET() {
  return new Response(LOADER, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
      // Other websites load it, so nothing may stop them.
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
