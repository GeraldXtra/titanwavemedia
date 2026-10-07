import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { frameAncestors } from "@/lib/assist/sites";

const PAGE_LIMIT = 60;
const PAGE_WINDOW = 60 * 1000;
const pageHits = new Map();
let pageCalls = 0;

function pageAllowed(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip")) || "unknown";
  const now = Date.now();
  const recent = (pageHits.get(ip) || []).filter((t) => t > now - PAGE_WINDOW);
  const ok = recent.length < PAGE_LIMIT;
  if (ok) recent.push(now);
  pageHits.set(ip, recent);
  if (++pageCalls % 500 === 0 || pageHits.size > 20000) {
    for (const [k, list] of pageHits) if (!list.length || list[list.length - 1] <= now - PAGE_WINDOW) pageHits.delete(k);
  }
  return ok ? 0 : Math.max(1, Math.ceil((recent[0] + PAGE_WINDOW - now) / 1000));
}

export async function proxy(request) {
  const chat = request.nextUrl.pathname === "/assist/chat";
  try {
    if (chat) {
      const wait = pageAllowed(request);
      if (wait) {
        return new NextResponse("Too many requests. Please try again in a minute.", {
          status: 429,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Retry-After": String(wait),
            "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
            "X-Content-Type-Options": "nosniff",
            "X-Robots-Tag": "noindex, nofollow",
          },
        });
      }
    }
    return chat ? await assistChat(request) : await renewSession(request);
  } catch (error) {
    console.error("[proxy] Failed, so the page carries on without it:", error);
    return chat ? chatResponse("") : NextResponse.next({ request });
  }
}

async function renewSession(request) {
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
  await supabase.auth.getClaims();
  return response;
}

const SITES_TTL = 60 * 1000;
const sitesKept = new Map();
let db = null;

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
  return chatResponse(sources);
}

function chatResponse(sources) {
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
