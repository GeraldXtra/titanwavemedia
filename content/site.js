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
// The same number the way people read it, like +234 706 409 4004.
const phone = /^234\d{10}$/.test(whatsapp) ? `+234 ${whatsapp.slice(3, 6)} ${whatsapp.slice(6, 9)} ${whatsapp.slice(9)}` : `+${whatsapp}`;

const site = {
  name: "Titan Wave Media",
  legalName: "Titan Wave Media LTD",
  rc: "[YOUR RC NUMBER]",
  email: "titanwavemedia@proton.me",
  location: "Lagos, Nigeria",
  whatsapp,
  whatsappUrl,
  phone,

  // Working hours in Lagos time, from Sunday to Saturday: [opening hour, closing hour] on a
  // 24 hour clock, or null for a closed day. The live lines on About and Support follow them,
  // and the hours written out on Support should match.
  hours: [null, [9, 18], [9, 18], [9, 18], [9, 18], [9, 18], [10, 14]],

  prices: {
    setup: "[SETUP PRICE]",
    care: "[MONTHLY PRICE]",
  },

  header: {
    homeLabel: "Titan Wave Media, home",
    navLabel: "Main",
    cta: { label: "Start a project", href: "/contact?need=ai-setup" },
    search: "Search",
    menu: "Menu",
    close: "Close",
  },

  skipLink: "Skip to content",

  // The main links: in the header on wide screens, and in the Menu panel on narrow ones.
  // "section" marks the link of the page you are on.
  nav: [
    { label: "AI Setup", href: "/ai-setup", section: "ai-setup" },
    { label: "Products", href: "/products", section: "products" },
    { label: "Synthetic Data", href: "/synthetic-data", section: "synthetic-data" },
    { label: "Privacy", href: "/privacy", section: "privacy" },
    { label: "Work", href: "/work", section: "work" },
    { label: "About", href: "/about", section: "about" },
  ],

  menu: {
    label: "Menu",
    searchLabel: "Search this site",
    searchPlaceholder: "Search this site, for example privacy or prices",
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
      { title: "Support", href: "/support", words: "help support hours reply urgent refunds your data requests whatsapp email questions" },
      { title: "Site guide", href: "/guide", words: "guide tour how this website works every page what you can do" },
    ],
  },

  // The footer: four columns of links, then a bottom row. In the Help column, "whatsapp" and
  // "email" stand for the WhatsApp number and the company email above.
  footer: {
    columns: [
      {
        title: "Services",
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
          { label: "About", href: "/about" },
          { label: "Work", href: "/work" },
          { label: "Updates", href: "/updates" },
        ],
      },
      {
        title: "Help",
        links: [
          { label: "Support", href: "/support" },
          { label: "Site guide", href: "/guide" },
          { label: "Contact", href: "/contact" },
          { label: "WhatsApp", whatsapp: true },
          { email: true },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Terms", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Refund Policy", href: "/refunds" },
        ],
      },
    ],
    // {year} is this year.
    base: "© {year} Titan Wave Media LTD. RC {rc}. Lagos, Nigeria.",
    baseLabel: "Policies",
    baseLinks: [
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
    ],
  },

  // The dialog behind "Cookie preferences" in the footer.
  cookies: {
    open: "Cookie preferences",
    title: "Cookie preferences",
    text: "This site only uses the cookies it needs to work. There are no advertising or tracking cookies.",
    remember: "Remember my choices",
    rememberHelp: "Keeps what you pick in the setup builder and the dataset builder in this browser for your next visit. Turn it off to delete them.",
    save: "Save",
    close: "Close",
  },

  // The closing block on most pages. A page can set its own instead.
  cta: {
    title: "Tell us what you need.",
    note: "We reply by email or WhatsApp. It is {clock} in Lagos right now.",
    buttons: [
      { label: "Chat on WhatsApp", href: whatsappUrl, style: "line", icon: "wa" },
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
