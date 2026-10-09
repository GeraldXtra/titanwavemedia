import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { setting, settingUrl } from "./settings.mjs";

export const SESSION_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export async function createUserClient() {
  const cookieStore = await cookies();
  return createServerClient(settingUrl("NEXT_PUBLIC_SUPABASE_URL"), setting("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
    cookieOptions: SESSION_COOKIE,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
        }
      },
    },
  });
}
