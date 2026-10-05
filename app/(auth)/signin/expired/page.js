import ExpiredForm from "@/components/auth/ExpiredForm";
import copy from "@/content/console/signin";

export const metadata = { ...copy.meta.expired, robots: { index: false, follow: false } };

export default function ExpiredPage() {
  return <ExpiredForm />;
}
