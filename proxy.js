import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { frameAncestors } from "@/lib/assist/sites";

// Runs before the console, the sign in pages and the Wave Assist chat page (see the matcher
// below; the rest of the public website is untouched).
export async function proxy(request) {
  if (request.nextUrl.pathname === "/assist/chat") return assistChat(request);

  // The console and sign in: renews the sign in cookie when it is close to running out, so
  // pages, which cannot set cookies themselves, always see a fresh one.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers || {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });
  // Loads the session and renews it if needed. Who the person is gets checked again, against
  // the sign in service, by every page and every action.
  await supabase.auth.getClaims();
  return response;
}

// ---------------------------------------------------------------------------------------------
// The Wave Assist chat page. It is shown in a frame on businesses' websites, so it gets its own
// headers here instead of the site's (next.config.mjs leaves it out): frame-ancestors lists our
// own site (for the console's test chat) and the websites the business added, so browsers refuse
// to show it anywhere else. No sign in work happens for it.

const SITES_TTL = 60 * 1000;
const sitesKept = new Map();
let db = null;

// The business's websites for a chat's public id, kept for up to a minute. Throws when the
// database cannot be read, so the page falls back to our own site only.
async function chatSites(publicId) {
  if (!/^[a-z0-9]{8,32}$/.test(publicId)) return [];
  const now = Date.now();
  const hit = sitesKept.get(publicId);
  if (hit && now - hit.at < SITES_TTL) return hit.sites;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("the database is not set up");
  if (!db) db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await db.from("assistants").select("sites").eq("public_id", publicId).abortSignal(AbortSignal.timeout(4000)).maybeSingle();
  if (error) throw new Error(error.message);
  const sites = data && Array.isArray(data.sites) ? data.sites : [];
  if (sitesKept.size > 5000) sitesKept.clear();
  sitesKept.set(publicId, { at: now, sites });
  return sites;
}

async function assistChat(request) {
  let sources = "";
  try {
    sources = frameAncestors(await chatSites(request.nextUrl.searchParams.get("id") || ""));
  } catch (error) {
    console.error("[assist] Could not read the chat's websites, so it shows on our own site only:", error.message);
  }
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors 'self'${sources ? ` ${sources}` : ""}`,
    process.env.VERCEL ? "upgrade-insecure-requests" : "",
  ]
    .filter(Boolean)
    .join("; ");
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  return response;
}

export const config = {
  matcher: [
    "/console",
    "/console/:path*",
    "/signin",
    "/signin/:path*",
    "/signup",
    "/auth/:path*",
    "/api/console/:path*",
    "/api/auth/:path*",
    "/api/pay/:path*",
    "/assist/chat",
  ],
};
