import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// The cookie that keeps someone signed in: never readable by scripts on the page, sent only over
// https on the live site, and only with requests from this site.
export const SESSION_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// The database client of the person making this request, from their sign in cookie. Row level
// security applies to it. Make a new one for every request.
export async function createUserClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: SESSION_COOKIE,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // A page cannot set cookies while it renders; proxy.js keeps the session fresh instead.
        }
      },
    },
  });
}
