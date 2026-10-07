import { NextResponse } from "next/server";
import { accountsReady } from "@/lib/accounts";
import { afterSignIn, landingFor } from "@/lib/auth";
import { createUserClient } from "@/lib/supabaseUser";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const failed = () => NextResponse.redirect(new URL("/signin?error=google", request.url), 303);
  const problem = `${url.searchParams.get("error_code") || ""} ${url.searchParams.get("error_description") || ""}`;
  if (!code && /signup_disabled|signups? not allowed/i.test(problem)) {
    console.error("[auth] google: this Google account has no account here yet, and new sign ups are switched off in Supabase");
    return NextResponse.redirect(new URL("/signup?error=google_new", request.url), 303);
  }
  if (!code && url.searchParams.get("error")) console.error("[auth] google callback:", url.searchParams.get("error_code") || url.searchParams.get("error"));
  if (!accountsReady() || !code) return failed();

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data || !data.user) {
    console.error("[auth] google callback:", error ? error.code || error.message : "no user");
    return failed();
  }
  const user = data.user;
  if ((user.factors || []).some((f) => f.factor_type === "totp" && f.status === "verified")) {
    return NextResponse.redirect(new URL("/signin/code?via=google", request.url), 303);
  }
  try {
    await afterSignIn(user, { method: "google", userAgent: request.headers.get("user-agent") });
  } catch (e) {
    console.error("[auth] after google sign in:", e.message);
  }
  return NextResponse.redirect(new URL(await landingFor(user), request.url), 303);
}
