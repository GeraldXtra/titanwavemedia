// Shared details used on every page: the company, how to reach it, the header, the menu,
// the footer and the closing "Tell us what you need" block.
//
// How the words work across the content folder:
// - Words in [square brackets] are placeholders. They show in grey until you replace them.
// - Words in {curly brackets} are filled in from this file: {email}, {rc}, {setupPrice},
//   {carePrice}, {location}. {clock} shows the time in Lagos.

// Digits only, with the country code. The NEXT_PUBLIC_WHATSAPP_NUMBER setting overrides it.
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2347064094004";
const whatsappUrl = `https://wa.me/${whatsapp}`;

const site = {
  name: "Titan Wave Media",
  legalName: "Titan Wave Media LTD",
  rc: "[YOUR RC NUMBER]",
  email: "titanwavemedia@proton.me",
  location: "Lagos, Nigeria",
  whatsapp,
  whatsappUrl,

  // Put the full profile address in href once the accounts exist.
  social: [
    { label: "[LinkedIn]", href: "" },
    { label: "[X]", href: "" },
  ],

  prices: {
    setup: "[SETUP PRICE]",
    care: "[MONTHLY PRICE]",
  },

  header: {
    homeLabel: "Titan Wave Media, home",
    cta: { label: "Start a project", href: "/contact?need=ai-setup" },
    menu: "Menu",
    close: "Close",
  },

  skipLink: "Skip to content",

  menu: {
    label: "Menu",
    searchLabel: "Search this site",
    searchPlaceholder: "Search this site, for example privacy or prices",
    // "section" marks the link as the current page for screen readers.
    links: [
      { label: "AI Setup", href: "/ai-setup", section: "ai-setup" },
      { label: "Products", href: "/products", section: "products" },
      { label: "Synthetic Data", href: "/synthetic-data", section: "synthetic-data" },
      { label: "Privacy", href: "/privacy", section: "privacy" },
      { label: "Work", href: "/work", section: "work" },
      { label: "About", href: "/about", section: "about" },
      { label: "Updates", href: "/updates" },
      { label: "Contact", href: "/contact" },
    ],
    base: "Titan Wave Media LTD, Lagos, Nigeria",
    whatsapp: "Chat on WhatsApp",
  },

  // The site search in the menu and on the "Page not found" page looks through this list.
  search: {
    noMatch: "No page matches that. Try the assistant at the bottom right.",
    pages: [
      { title: "Home", href: "/", words: "AI we set up for you, tools you can use today, and data that keeps your customers private" },
      { title: "AI Setup", href: "/ai-setup", words: "chat assistants automation dashboards AI inside your software build your setup pricing quote" },
      { title: "Products", href: "/products", words: "AI tools you can use today coming soon notify" },
      { title: "Synthetic Data", href: "/synthetic-data", words: "realistic data no real people dataset builder sample csv" },
      { title: "Privacy", href: "/privacy", words: "your data stays private remove personal details NDPA" },
      { title: "Work", href: "/work", words: "sites apps and AI systems built for clients projects" },
      { title: "About", href: "/about", words: "AI company in Lagos founder company details registered timeline" },
      { title: "Contact", href: "/contact", words: "tell us what you need whatsapp email form" },
      { title: "Updates", href: "/updates", words: "news product launches" },
      { title: "Terms of Service", href: "/terms", words: "terms" },
      { title: "Privacy Policy", href: "/privacy-policy", words: "policy data protection rights" },
      { title: "Refund Policy", href: "/refunds", words: "refund money back cancel" },
    ],
  },

  footer: {
    text: "An AI company in Lagos, Nigeria. AI we set up for you, tools you can use today, and data that keeps your customers private.",
    columns: [
      {
        title: "What we do",
        links: [
          { label: "AI Setup", href: "/ai-setup" },
          { label: "Products", href: "/products" },
          { label: "Synthetic Data", href: "/synthetic-data" },
          { label: "Privacy", href: "/privacy" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Work", href: "/work" },
          { label: "About", href: "/about" },
          { label: "Updates", href: "/updates" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    talk: {
      title: "Talk to us",
      whatsapp: "Chat on WhatsApp",
      time: "Lagos time {clock} WAT",
      socialJoin: " and ",
    },
    wordmark: "Titan Wave Media",
    legalLabel: "Legal",
    legal: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Refunds", href: "/refunds" },
    ],
    rcLine: "RC {rc}",
    copyright: "Titan Wave Media LTD",
  },

  // The closing block on most pages. A page can set its own instead.
  cta: {
    title: "Tell us what you need.",
    note: "We reply by email or WhatsApp. It is {clock} in Lagos right now.",
    buttons: [
      { label: "Chat on WhatsApp", href: whatsappUrl, style: "solid", icon: "wa" },
      { label: "Send an email", href: "/contact", style: "line", icon: "mail" },
    ],
  },

  backToTop: "Back to the top",

  // What search engines are told about the company (the Organization block on every page).
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Titan Wave Media LTD",
    foundingDate: "2026-04-01",
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    description: "An AI company in Lagos, Nigeria: AI setup for businesses, AI tools, synthetic data and privacy safe AI.",
  },

  // Read out before each numbered step by screen readers.
  stepLabel: "Step {n}: ",

  // The name of the "On this page" bars and the contents list on the legal pages.
  onThisPage: "On this page",

  // The "Notify me" email forms on the home, Products, product and Updates pages.
  notifyForm: {
    label: "Email address",
    placeholder: "you@company.com",
    button: "Notify me",
    empty: "Enter your email address.",
    invalid: "Enter an email address like name@company.com.",
    thanks: "Thanks. We will email you when it is ready.",
    failed: "That did not go through. Please try again in a moment.",
  },
};

export default site;
