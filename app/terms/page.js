import terms from "@/content/terms";
import LegalPage from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...terms.meta, path: "/terms" });

export default function TermsPage() {
  return <LegalPage id="terms" content={terms} />;
}
