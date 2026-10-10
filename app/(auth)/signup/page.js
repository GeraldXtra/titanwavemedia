import SignUpForm from "@/components/auth/SignUpForm";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady, googleSignIn } from "@/lib/accounts";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.signup, alternates: { canonical: "/signup" } };

export default function SignUpPage() {
  if (!accountsReady()) return <NotSwitchedOn />;
  return <SignUpForm google={googleSignIn} fromAddress />;
}
