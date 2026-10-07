import site from "@/content/site";

export const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");

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
