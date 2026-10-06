import ConfirmLink from "@/components/auth/ConfirmLink";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady } from "@/lib/accounts";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.verify, robots: { index: false, follow: false } };

// The page every sign in link opens. It signs the person in from the browser, with the token
// hash in the address.
export default function ConfirmPage() {
  if (!accountsReady()) return <NotSwitchedOn />;
  return <ConfirmLink />;
}
