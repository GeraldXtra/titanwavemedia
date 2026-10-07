import AssistView from "@/components/console/assist/AssistView";
import { clientContext } from "@/lib/console";
import copy from "@/content/console/assist";

export const metadata = { title: copy.meta.title };

export default async function AssistPage({ searchParams }) {
  const sp = await searchParams;
  const ctx = await clientContext();
  return <AssistView db={ctx.supabase} business={ctx.business} sp={sp} base="/console/assist" />;
}
