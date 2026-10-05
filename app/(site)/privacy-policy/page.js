import privacyPolicy from "@/content/privacy-policy";
import LegalPage from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...privacyPolicy.meta, path: "/privacy-policy" });

export default function PrivacyPolicyPage() {
  return <LegalPage id="privacy-policy" content={privacyPolicy} />;
}
