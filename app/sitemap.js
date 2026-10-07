import productList from "@/content/product-list";
import project from "@/content/project";
import post from "@/content/post";
import { siteUrl } from "@/lib/seo";

const PAGES = [
  ["/", 1],
  ["/ai-setup", 0.9],
  ["/products", 0.8],
  ["/synthetic-data", 0.8],
  ["/privacy", 0.8],
  ["/work", 0.7],
  ["/about", 0.7],
  ["/contact", 0.8],
  ["/updates", 0.6],
  ["/support", 0.6],
  ["/guide", 0.5],
  ["/terms", 0.3],
  ["/privacy-policy", 0.3],
  ["/refunds", 0.3],
];

function published(prefix, pages) {
  return Object.entries(pages)
    .filter(([, page]) => page.published)
    .map(([slug]) => ({ url: `${siteUrl}${prefix}/${slug}`, priority: 0.6 }));
}

export default function sitemap() {
  return [
    ...PAGES.map(([path, priority]) => ({ url: siteUrl + (path === "/" ? "" : path), priority })),
    ...productList.items.map((p) => ({ url: `${siteUrl}/products/${p.slug}`, priority: 0.6 })),
    ...published("/work", project.pages),
    ...published("/updates", post.pages),
  ];
}
