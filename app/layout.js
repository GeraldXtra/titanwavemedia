import { Open_Sans } from "next/font/google";
import "./globals.css";
import SvgSprite from "@/components/SvgSprite";
import site from "@/content/site";
import home from "@/content/home";
import { siteUrl } from "@/lib/seo";

// Open Sans in five weights. Only the basic Latin file is preloaded; the extended Latin one
// (with the naira sign, ₦) loads when a page uses it.
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
  variable: "--font-open-sans",
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
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(site.organization).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <SvgSprite />
        {/* The public pages add the site header and footer in app/(site)/layout.js; sign in
            and the console have their own. */}
        {children}
      </body>
    </html>
  );
}
