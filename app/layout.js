import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import SvgSprite from "@/components/SvgSprite";
import SkipLink from "@/components/SkipLink";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollUi from "@/components/ScrollUi";
import ChatWidget from "@/components/ChatWidget";
import SiteEffects from "@/components/SiteEffects";
import site from "@/content/site";
import home from "@/content/home";
import { siteUrl } from "@/lib/seo";

// Bricolage Grotesque with its optical size axis, as the design loads it. Only the basic Latin
// file is preloaded; the extended Latin one (with the naira sign, ₦) loads when a page uses it.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: home.meta.title,
  description: home.meta.description,
  // Each page's title and description fill in the rest of its shared preview.
  openGraph: {
    type: "website",
    siteName: site.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0B0B",
};

// Runs before the first paint: turns on the motion styles, and turns them off again if the
// site's scripts have not started after four seconds, so nothing stays hidden.
const motionFlag =
  "(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!window.__siteReady)d.classList.remove('js')},4000)})()";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={bricolage.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(site.organization).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <SvgSprite />
        <SkipLink label={site.skipLink} />
        <Header />
        <div id="content">{children}</div>
        <Footer />
        <ScrollUi />
        <ChatWidget />
        <SiteEffects />
      </body>
    </html>
  );
}
