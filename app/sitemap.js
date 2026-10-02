import product from "@/content/product";
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
  ["/terms", 0.3],
  ["/privacy-policy", 0.3],
  ["/refunds", 0.3],
];

// Product, project and post pages join the sitemap once they are marked published in content/.
function published(prefix, pages) {
  return Object.entries(pages)
    .filter(([, page]) => page.published)
    .map(([slug]) => ({ url: `${siteUrl}${prefix}/${slug}`, priority: 0.6 }));
}

export default function sitemap() {
  return [
    ...PAGES.map(([path, priority]) => ({ url: siteUrl + (path === "/" ? "" : path), priority })),
    ...published("/products", product.pages),
    ...published("/work", project.pages),
    ...published("/updates", post.pages),
  ];
}
