import { NextResponse } from "next/server";
import { accountsReady } from "@/lib/accounts";
import { afterSignIn, landingFor } from "@/lib/auth";
import { createUserClient } from "@/lib/supabaseUser";

export const runtime = "nodejs";

// Where Google sends people back. Signs them in, then asks for their code if two step sign in
// is on.
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const failed = () => NextResponse.redirect(new URL("/signin?error=google", request.url), 303);
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
