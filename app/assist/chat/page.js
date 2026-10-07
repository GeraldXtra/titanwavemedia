import AssistChat from "@/components/assist/AssistChat";
import words from "@/content/assist";

export const metadata = {
  title: words.meta.title,
  robots: { index: false, follow: false },
};

export default function ChatPage() {
  return <AssistChat />;
}
