import ExpiredForm from "@/components/auth/ExpiredForm";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady } from "@/lib/accounts";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.expired, robots: { index: false, follow: false } };

export default function ExpiredPage() {
  if (!accountsReady()) return <NotSwitchedOn />;
  return <ExpiredForm />;
}
