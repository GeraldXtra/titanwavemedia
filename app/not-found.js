import Link from "next/link";
import notFound from "@/content/not-found";
import Hero from "@/components/Hero";
import SiteSearch from "@/components/SiteSearch";
import SiteChrome from "@/components/SiteChrome";

export const metadata = {
  title: notFound.meta.title,
  description: notFound.meta.description,
};

export default function NotFound() {
  return (
    <SiteChrome>
      <main className="page" id="main-404">
        <Hero title={notFound.hero.title} text={notFound.hero.text}>
          <SiteSearch inputId="s404" label={notFound.searchLabel} placeholder={notFound.searchPlaceholder} />
          <ul className="quick">
            {notFound.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </Hero>
      </main>
    </SiteChrome>
  );
}
