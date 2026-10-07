const updates = {
  meta: {
    title: "Updates, Titan Wave Media",
    description: "Product launches, what we're building, and what we learn along the way.",
  },

  hero: {
    title: "Read what we're building and launching.",
    text: "Product launches, what we're building, and what we learn along the way.",
  },

  listTitle: "All updates",

  filters: {
    label: "Filter updates",
    options: [
      { value: "all", label: "All" },
      { value: "product", label: "Product" },
      { value: "news", label: "News" },
      { value: "learned", label: "What we learned" },
    ],
  },

  items: [
    {
      slug: "meet-wave-assist",
      cat: "product",
      tag: "Product",
      date: "6 October 2026",
      datetime: "2026-10-06",
      title: "Meet Wave Assist",
      summary: "A chat assistant for your own website. It answers your customers from what you teach it, and hands them to you when it isn't sure.",
    },
    {
      slug: "ledgerwatch-is-live",
      cat: "product",
      tag: "Product",
      date: "6 August 2026",
      datetime: "2026-08-06",
      title: "LedgerWatch is live",
      summary: "Our app for businesses that sell on credit is live and free. It keeps track of who owes you, sends the reminders, and watches coin prices.",
    },
  ],

  notify: {
    title: "Get our updates by email.",
    text: "We only email you when there's something new.",
    thanks: "Thanks. You'll hear from us when there's news.",
  },
};

export default updates;
