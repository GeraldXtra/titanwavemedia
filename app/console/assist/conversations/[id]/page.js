import ConversationView from "@/components/console/assist/ConversationView";
import { clientContext } from "@/lib/console";
import copy from "@/content/console/assist";

export const metadata = { title: copy.meta.conversation };

// One Wave Assist conversation of the person's own business. The bell's handover notice opens it.
export default async function AssistConversationPage({ params }) {
  const { id } = await params;
  const ctx = await clientContext();
  return <ConversationView db={ctx.supabase} business={ctx.business} id={id} base="/console/assist" canDelete={ctx.role === "owner"} />;
}
