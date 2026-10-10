import SignInForm from "@/components/auth/SignInForm";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady, googleSignIn } from "@/lib/accounts";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.signin, alternates: { canonical: "/signin" } };

export default function SignInPage() {
  if (!accountsReady()) return <NotSwitchedOn />;
  return <SignInForm google={googleSignIn} fromAddress />;
}
