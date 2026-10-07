import ConfirmLink from "@/components/auth/ConfirmLink";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady } from "@/lib/accounts";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.verify, robots: { index: false, follow: false } };

export default function ConfirmPage() {
  if (!accountsReady()) return <NotSwitchedOn />;
  return <ConfirmLink />;
}
