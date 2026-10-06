// The Products page. The products themselves come from content/product-list.js, and the first
// three of them also show on the home page. Each product links to its own page; the words for
// those pages are in content/product.js.

const products = {
  meta: {
    title: "Products, Titan Wave Media",
    description: "AI tools you can use today. Small products, each one made to fix one real problem.",
  },

  hero: {
    title: "AI tools you can use today.",
    text: "Small products, each one made to fix one real problem.",
  },

  // A heading for screen readers over the list below (it is not shown on the page).
  listTitle: "All products",

  filters: {
    label: "Filter products",
    all: "All",
    // The name of each "cat" in content/product-list.js, in the order the buttons show.
    // A button shows only when at least one product has that cat.
    cats: {
      support: "Customer support",
      sales: "Selling online",
      finance: "Money and records",
      data: "Data and privacy",
    },
    searchLabel: "Search products",
    searchPlaceholder: "Search products",
    empty: "Nothing matches yet. Try another word.",
  },

  // The buttons on each product card. {name} is the product's name and {slug} its address.
  card: {
    details: "Details",
    // Live products: opens the product's own website in a new tab.
    open: "Open {name}",
    // Products that are available now: the contact form, with the product picked.
    talk: { label: "Talk to us", href: "/contact?need=tool&product={slug}" },
    // Products that are coming soon: brings the email form below into view.
    notify: "Notify me",
  },

  notify: {
    title: "Get told when a new product opens.",
    text: "Leave your email and we'll tell you when the next one is ready.",
    thanks: "Thanks. We'll email you when the next one is ready.",
  },

  strip: {
    text: "Need something built just for your business?",
    button: { label: "Start a project", href: "/contact?need=ai-setup" },
  },
};

export default products;
