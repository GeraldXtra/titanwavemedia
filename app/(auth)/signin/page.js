import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/SignInForm";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady, googleSignIn } from "@/lib/accounts";
import { getContext } from "@/lib/auth";
import { isEmail } from "@/lib/validate";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.signin, alternates: { canonical: "/signin" } };

export default async function SignInPage({ searchParams }) {
  if (!accountsReady()) return <NotSwitchedOn />;
  const ctx = await getContext();
  if (ctx.user) redirect(ctx.needsCode ? "/signin/code" : "/console");
  const sp = await searchParams;
  const notice = sp.deleted ? copy.signin.deleted : sp.signed_out ? copy.signin.signedOut : sp.error === "google" ? copy.signin.googleFailed : null;
  const email = typeof sp.email === "string" && isEmail(sp.email) ? sp.email : "";
  return <SignInForm google={googleSignIn} notice={notice} email={email} />;
}
