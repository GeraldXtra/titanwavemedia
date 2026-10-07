const product = {
  meta: {
    title: "{name}, Titan Wave Media",
  },

  labels: {
    crumb: "Products",
    open: "Open {name}",
    talk: { label: "Talk to us", href: "/contact?need=tool&product={slug}" },
    notify: "Notify me",
    ask: { label: "Ask a question", href: "/contact?need=tool&product={slug}" },
    features: "What it does",
    questions: "Questions",
    privacy: {
      text: "Built under our privacy rules.",
      link: { label: "How we protect data", href: "/privacy" },
    },
    share: "Share this product",
    copy: "Copy link",
    copied: "Link copied",
    copyPrompt: "Copy this link",
    notifyTitle: "Get told when {name} opens.",
    thanks: "Thanks. We'll email you when it's ready.",
  },

  faq: {
    live: [
      {
        q: "How do I start?",
        a: "Press the button at the top of this page. It opens on its own website, in a new tab.",
      },
      {
        q: "Who do I ask if I need help?",
        a: ["Ask us. Our ", { link: "Support", href: "/support" }, " page shows every way to reach us."],
      },
    ],
    available: [
      {
        q: "How much does it cost?",
        a: "We agree the price with you before anything starts. Press Talk to us and tell us a little about your business.",
      },
      {
        q: "How do I ask for it?",
        a: "Press Talk to us at the top of this page, or message us on WhatsApp. We reply the same working day.",
      },
    ],
    soon: [
      {
        q: "When will it be ready?",
        a: "We don't have a date yet. Leave your email below and we'll tell you the day it opens.",
      },
      {
        q: "How much will it cost?",
        a: "We'll share the price when it launches.",
      },
      {
        q: "Can I tell you what I need from it?",
        a: "Yes. Press Ask a question at the top of this page. The products people ask for most get built first.",
      },
    ],
  },
};

export default product;
