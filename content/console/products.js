import productList, { priceOf } from "@/content/product-list";

// The products in the console. The list itself is content/product-list.js, which the website
// reads too; this file has only the console's words. Wave Assist works here in the console,
// LedgerWatch is live on its own website, and the products on the way show Coming soon with
// Notify me. Every Notify me counts on the Team view's Product interest page, together with the
// website's notify list (a website sign up from a product page with the same slug).

const products = {
  meta: { title: "Products, Titan Wave Media Console" },
  title: "Products",
  lede: "Tools for your business. Wave Assist works right here in your console, LedgerWatch is live on its own website, and the rest are on the way. Tell us which ones you want, and we'll email you the day each one opens.",

  // The chip for each status, and the price line: "Live", "Available now", "Coming soon".
  status: productList.status,

  // The console page of a product that works in the console.
  pages: { "wave-assist": "/console/assist" },

  // A product that works today.
  openProduct: "Open {name}",
  newTab: "(opens in a new tab)",
  whatLive: "What it does",
  useTitle: "Use it",
  useLive: "{name} works on its own website, so it opens there.",
  useHere: "{name} works here in your console. Set it up, test it and put it on your website.",
  seeMore: "See what it does",

  // A product on the way.
  notify: "Notify me",
  notified: "We'll tell you",
  notifiedHelp: "We email you the day it opens.",
  doneOn: "Done. We'll email you when {name} opens.",
  doneOff: "We won't tell you about {name}.",
  open: "See what it will do",
  whatTitle: "What it will do",
  wantTitle: "Want it?",
  wantText: "Tell us, and we'll email you the day it opens. The products people ask for most get built first.",
  back: "Products",

  items: productList.items,
};

export { priceOf };
export default products;
