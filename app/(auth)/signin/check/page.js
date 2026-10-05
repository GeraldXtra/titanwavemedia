import CheckEmail from "@/components/auth/CheckEmail";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.check, robots: { index: false, follow: false } };

export default function CheckPage() {
  return <CheckEmail />;
}
