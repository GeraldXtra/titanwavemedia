import contact from "@/content/contact";
import site from "@/content/site";
import Hero from "@/components/Hero";
import ContactBlock from "@/components/ContactBlock";
import { Section } from "@/components/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ ...contact.meta, path: "/contact" });

export default function ContactPage() {
  return (
    <main className="page" id="main-contact">
      <Hero title={contact.hero.title} text={contact.hero.text} />
      <Section tone="white">
        <ContactBlock copy={contact} site={{ whatsappUrl: site.whatsappUrl, email: site.email }} />
      </Section>
    </main>
  );
}
