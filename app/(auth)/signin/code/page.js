import { redirect } from "next/navigation";
import CodeForm from "@/components/auth/CodeForm";
import NotSwitchedOn from "@/components/auth/NotSwitchedOn";
import { accountsReady } from "@/lib/accounts";
import { getContext } from "@/lib/auth";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.code, robots: { index: false, follow: false } };

export default async function CodePage() {
  if (!accountsReady()) return <NotSwitchedOn />;
  const ctx = await getContext();
  if (!ctx.user) redirect("/signin");
  if (!ctx.needsCode) redirect("/console");
  return <CodeForm />;
}
