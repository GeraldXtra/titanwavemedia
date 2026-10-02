// The Work page. The first three projects also show on the home page.
// Each project links to its own page; the words for those pages are in content/project.js.

const work = {
  meta: {
    title: "Our work, Titan Wave Media",
    description: "Sites, apps and AI systems we have built for clients.",
  },

  hero: {
    title: "Our work.",
    text: "Sites, apps and AI systems we have built for clients.",
  },

  filters: {
    label: "Filter projects",
    // "value" must match the "cat" of the projects below.
    options: [
      { value: "all", label: "All" },
      { value: "ai", label: "AI setup" },
      { value: "product", label: "Products" },
      { value: "data", label: "Data" },
    ],
    searchLabel: "Search projects",
    searchPlaceholder: "Search projects",
  },

  // The words that show when a tile is turned over.
  flip: {
    problem: "The problem",
    built: "What we built",
  },

  items: [
    { slug: "example", cat: "ai", tag: "AI setup", client: "[Client name]", screenshot: "[Project screenshot]", needed: "[What the client needed]", built: "[What we built]" },
    { slug: "example", cat: "product", tag: "Product", client: "[Client name]", screenshot: "[Project screenshot]", needed: "[What the client needed]", built: "[What we built]" },
    { slug: "example", cat: "data", tag: "Data", client: "[Client name]", screenshot: "[Project screenshot]", needed: "[What the client needed]", built: "[What we built]" },
    { slug: "example", cat: "ai", tag: "AI setup", client: "[Client name]", screenshot: "[Project screenshot]", needed: "[What the client needed]", built: "[What we built]" },
    { slug: "example", cat: "product", tag: "Product", client: "[Client name]", screenshot: "[Project screenshot]", needed: "[What the client needed]", built: "[What we built]" },
    { slug: "example", cat: "data", tag: "Data", client: "[Client name]", screenshot: "[Project screenshot]", needed: "[What the client needed]", built: "[What we built]" },
  ],

  cta: {
    title: "Want to be next?",
    buttons: [{ label: "Start a project", href: "/contact?need=ai-setup", style: "dark" }],
  },
};

export default work;
