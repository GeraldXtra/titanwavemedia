import CheckEmail from "@/components/auth/CheckEmail";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady } from "@/lib/accounts";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.check, robots: { index: false, follow: false } };

export default function CheckPage() {
  if (!accountsReady()) return <NotSwitchedOn />;
  return <CheckEmail />;
}
