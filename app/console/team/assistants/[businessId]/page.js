import { notFound } from "next/navigation";
import AssistView from "@/components/console/assist/AssistView";
import { isUuid } from "@/lib/assist/consoleApi";
import { teamContext } from "@/lib/console";
import { getAdmin } from "@/lib/supabase";
import copy from "@/content/console/assist";

export const metadata = { title: copy.meta.title };

// Team view: one business's Wave Assist, with the same tabs the business sees, plus its monthly
// limit. Every change made here goes in the team log.
export default async function TeamAssistantPage({ params, searchParams }) {
  const { businessId } = await params;
  const sp = await searchParams;
  if (!isUuid(businessId)) notFound();
  await teamContext();
  const admin = getAdmin();
  const { data: business } = await admin.from("businesses").select("id, name").eq("id", businessId).maybeSingle();
  if (!business) notFound();
  return <AssistView db={admin} business={business} sp={sp} base={`/console/team/assistants/${business.id}`} team />;
}
