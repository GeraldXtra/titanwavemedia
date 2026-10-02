import refunds from "@/content/refunds";
import LegalPage from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...refunds.meta, path: "/refunds" });

export default function RefundsPage() {
  return <LegalPage id="refunds" content={refunds} />;
}
