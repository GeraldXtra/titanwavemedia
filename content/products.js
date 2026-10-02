// The Products page. The first three products also show on the home page.
// Each product links to its own page; the words for those pages are in content/product.js.

const products = {
  meta: {
    title: "Products, Titan Wave Media",
    description: "AI tools you can use today. Small products, each one made to fix one real problem.",
  },

  hero: {
    title: "AI tools you can use today.",
    text: "Small products, each one made to fix one real problem.",
  },

  filters: {
    label: "Filter products",
    // "value" must match the "cat" of the products below.
    options: [
      { value: "all", label: "All" },
      { value: "support", label: "Customer support" },
      { value: "sales", label: "Sales" },
      { value: "finance", label: "Finance" },
    ],
    searchLabel: "Search products",
    searchPlaceholder: "Search products",
    empty: "Nothing matches yet. Try another word.",
  },

  items: [
    { slug: "example", cat: "support", name: "[Product name]", text: "[What it does]", price: "[Price]", tag: "Coming soon" },
    { slug: "example", cat: "sales", name: "[Product name]", text: "[What it does]", price: "[Price]", tag: "Coming soon" },
    { slug: "example", cat: "finance", name: "[Product name]", text: "[What it does]", price: "[Price]", tag: "Coming soon" },
  ],

  card: {
    details: "Details",
    notify: "Notify me",
  },

  notify: {
    title: "Our first product is on the way.",
    text: "Leave your email and we will tell you when it is ready.",
    thanks: "Thanks. We will email you when it is ready.",
  },

  strip: {
    text: "Need something built just for your business?",
    button: { label: "Start a project", href: "/contact?need=ai-setup" },
  },
};

export default products;
