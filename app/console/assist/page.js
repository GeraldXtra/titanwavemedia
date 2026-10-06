import AssistView from "@/components/console/assist/AssistView";
import { clientContext } from "@/lib/console";
import copy from "@/content/console/assist";

export const metadata = { title: copy.meta.title };

// Wave Assist for the person's own business: set it up, test it, put it on a website, and read
// its conversations. Tabs are links: ?tab=setup|test|install|conversations|questions.
export default async function AssistPage({ searchParams }) {
  const sp = await searchParams;
  const ctx = await clientContext();
  return <AssistView db={ctx.supabase} business={ctx.business} sp={sp} base="/console/assist" />;
}
