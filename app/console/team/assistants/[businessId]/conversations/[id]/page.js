import { notFound } from "next/navigation";
import ConversationView from "@/components/console/assist/ConversationView";
import { isUuid } from "@/lib/assist/consoleApi";
import { teamContext } from "@/lib/console";
import { getAdmin } from "@/lib/supabase";
import copy from "@/content/console/assist";

export const metadata = { title: copy.meta.conversation };

export default async function TeamAssistConversationPage({ params }) {
  const { businessId, id } = await params;
  if (!isUuid(businessId)) notFound();
  await teamContext();
  const admin = getAdmin();
  const { data: business } = await admin.from("businesses").select("id, name").eq("id", businessId).maybeSingle();
  if (!business) notFound();
  return <ConversationView db={admin} business={business} id={id} base={`/console/team/assistants/${business.id}`} team canDelete />;
}
