import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Runs before the console and the sign in pages (see the matcher below; the public website is
// untouched). It renews the sign in cookie when it is close to running out, so pages, which
// cannot set cookies themselves, always see a fresh one.
export async function proxy(request) {
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

export const config = {
  matcher: ["/console", "/console/:path*", "/signin", "/signin/:path*", "/signup", "/auth/:path*", "/api/console/:path*", "/api/auth/:path*", "/api/pay/:path*"],
};
