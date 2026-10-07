import { redirect } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady, googleSignIn } from "@/lib/accounts";
import { getContext } from "@/lib/auth";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.signup, alternates: { canonical: "/signup" } };

export default async function SignUpPage({ searchParams }) {
  if (!accountsReady()) return <NotSwitchedOn />;
  const ctx = await getContext();
  if (ctx.user) redirect(ctx.needsCode ? "/signin/code" : "/console");
  const sp = await searchParams;
  const email = typeof sp.email === "string" && isEmail(sp.email) ? sp.email : "";
  const notice = sp.error === "google_new" ? copy.signup.googleNew : null;
  return <SignUpForm email={email} google={googleSignIn} notice={notice} />;
}
