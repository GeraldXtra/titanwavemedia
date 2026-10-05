import { NextResponse } from "next/server";
import { accountsReady } from "@/lib/accounts";
import { sameOrigin } from "@/lib/security";
import { createUserClient } from "@/lib/supabaseUser";

export const runtime = "nodejs";

// Sign out, from a form. With all=1 it signs out of every device ("Sign out of all devices" in
// Settings, Security): every session ends at once.
export async function POST(request) {
  const back = NextResponse.redirect(new URL("/signin?signed_out=1", request.url), 303);
  if (!sameOrigin(request) || !accountsReady()) return back;
  let all = false;
  try {
    const form = await request.formData();
    all = form.get("all") === "1";
  } catch {}
  const supabase = await createUserClient();
  await supabase.auth.signOut({ scope: all ? "global" : "local" });
  return back;
}
