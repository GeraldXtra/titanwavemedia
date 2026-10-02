import site from "@/content/site";

// The site's own address, for links in the sitemap and in shared previews. On Vercel the
// production address is known automatically; SITE_URL overrides it (for example a custom domain).
export const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");

// Title, description and sharing details for one page.
// Shared previews take the page's title and description, and the image from app/opengraph-image.js.
// `shareText` gives a different description for shared previews (the home page has one).
// `index: false` keeps a page out of search results (template pages until they are published).
export function pageMeta({ title, description, shareText, path, index = true }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(shareText
      ? { openGraph: { type: "website", siteName: site.name, title, description: shareText, url: path } }
      : {}),
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
