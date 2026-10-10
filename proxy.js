import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { frameAncestors } from "@/lib/assist/sites";
import { PASS_HEADER, PATH_HEADER, makePass } from "@/lib/sessionPass";
import { missingSettings, setting, settingUrl, supabaseUrl } from "@/lib/settings.mjs";

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
    if (chat) return chatResponse("");
    const headers = new Headers(request.headers);
    headers.delete(PASS_HEADER);
    headers.delete(PATH_HEADER);
    return NextResponse.next({ request: { headers } });
  }
}

const SESSION = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
const MARK = "twm_session";
const HOP = "twm_hop";
const MARK_AGE = 400 * 24 * 60 * 60;
const AUTH_PAGES = new Set(["/signin", "/signup"]);

function isPrefetch(request) {
  const h = request.headers;
  return h.get("next-router-prefetch") === "1" || /prefetch/i.test(h.get("sec-purpose") || h.get("purpose") || "");
}

async function renewSession(request) {
  const url = settingUrl("NEXT_PUBLIC_SUPABASE_URL");
  const key = setting("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const path = request.nextUrl.pathname;
  let claims = null;
  let changed = [];
  let extra = {};
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookieOptions: SESSION,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list, headers) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          changed = list;
          extra = headers || {};
        },
      },
    });
    const { data } = await supabase.auth.getClaims();
    claims = data && data.claims && typeof data.claims.sub === "string" ? data.claims : null;
  }

  const authPage = AUTH_PAGES.has(path);
  let target = null;
  if (authPage && claims && !request.cookies.has(HOP)) target = "/console";
  else if (path === "/signin/code" && url && key && !missingSettings().length) target = !claims ? "/signin" : claims.aal === "aal2" ? "/console" : null;
  let response;
  if (target) {
    response = NextResponse.redirect(new URL(target, request.url), 307);
    if (authPage && !isPrefetch(request)) response.cookies.set(HOP, "1", { ...SESSION, maxAge: 20 });
  } else {
    const headers = new Headers(request.headers);
    headers.delete(PASS_HEADER);
    headers.set(PATH_HEADER, path);
    const pass = await makePass(claims);
    if (pass) headers.set(PASS_HEADER, pass);
    response = NextResponse.next({ request: { headers } });
    if (authPage && request.cookies.has(HOP)) response.cookies.set(HOP, "", { ...SESSION, maxAge: 0 });
  }
  changed.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(extra).forEach(([k, v]) => response.headers.set(k, v));
  if (claims && !request.cookies.has(MARK)) response.cookies.set(MARK, "1", { ...SESSION, maxAge: MARK_AGE });
  if (!claims && request.cookies.has(MARK) && !path.startsWith("/api/") && path !== "/auth/callback") response.cookies.set(MARK, "", { ...SESSION, maxAge: 0 });
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
  const url = supabaseUrl();
  const key = setting("SUPABASE_SERVICE_KEY");
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
    { source: "/signin", has: [{ type: "cookie", key: "twm_session" }] },
    { source: "/signup", has: [{ type: "cookie", key: "twm_session" }] },
    "/signin/code",
    "/auth/callback",
    "/auth/google",
    "/auth/signout",
    "/api/console/:path*",
    "/api/auth/:path*",
    "/api/pay/:path*",
    "/assist/chat",
  ],
};
