import { NextResponse } from "next/server";
import { accountsReady } from "@/lib/accounts";
import { endSessions, getSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
import { SESSION_COOKIE, SESSION_MARK } from "@/lib/supabaseUser";

export const runtime = "nodejs";

export async function POST(request) {
  const back = NextResponse.redirect(new URL("/signin?signed_out=1", request.url), 303);
  if (!sameOrigin(request) || !accountsReady()) return back;
  back.cookies.set(SESSION_MARK, "", { ...SESSION_COOKIE, maxAge: 0 });
  let all = false;
  try {
    const form = await request.formData();
    all = form.get("all") === "1";
  } catch {}
  const { supabase, claims } = await getSession();
  await supabase.auth.signOut({ scope: all ? "global" : "local" });
  if (claims) await endSessions(claims, all);
  return back;
}
