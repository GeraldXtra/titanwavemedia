import AssistChat from "@/components/assist/AssistChat";
import words from "@/content/assist";

// The Wave Assist chat, shown in a frame on a business's website by /assist.js, and as the test
// chat in the console. The page itself is the same for everyone: it reads which business it is
// for in the browser. proxy.js sets its headers, including the websites that may show it. Its
// links to our own pages are relative, so they always point at the address it is served from.
export const metadata = {
  title: words.meta.title,
  robots: { index: false, follow: false },
};

export default function ChatPage() {
  return <AssistChat />;
}
