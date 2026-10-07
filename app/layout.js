import { Open_Sans } from "next/font/google";
import "./globals.css";
import SvgSprite from "@/components/SvgSprite";
import site from "@/content/site";
import home from "@/content/home";
import { siteUrl } from "@/lib/seo";
import { THEME_COLORS, THEME_SCRIPT } from "@/lib/theme";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(site.organization).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <SvgSprite />
        {children}
      </body>
    </html>
  );
}
