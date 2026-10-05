import { NextResponse } from "next/server";
import { accountsReady, googleSignIn } from "@/lib/accounts";
import { siteUrl } from "@/lib/seo";
import { createUserClient } from "@/lib/supabaseUser";

export const runtime = "nodejs";

// "Continue with Google": starts Google's sign in, with the check code kept in a cookie, and
// sends the person to Google. They come back to /auth/callback.
export async function GET(request) {
  if (!accountsReady() || !googleSignIn) return NextResponse.redirect(new URL("/signin", request.url), 303);
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl}/auth/callback`, skipBrowserRedirect: true },
  });
  if (error || !data || !data.url) {
    console.error("[auth] google:", error ? error.message : "no address");
    return NextResponse.redirect(new URL("/signin?error=google", request.url), 303);
  }
  return NextResponse.redirect(data.url, 303);
}
