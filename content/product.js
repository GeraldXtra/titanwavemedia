// The product page template. Each entry in `pages` is a page at /products/<key>.
// To add a product, copy the "example" entry, give it a new key and change the words.
// Set `published` to true once a page has real words, so search engines are told about it.

const product = {
  // Shared by every product page.
  labels: {
    crumb: "Products",
    notify: "Notify me",
    ask: { label: "Ask a question", href: "/contact?need=tool" },
    features: "What it does",
    who: "Who it's for",
    get: "How you get it",
    questions: "Questions",
    privacy: {
      text: "Built under our privacy rules.",
      link: { label: "How we protect data", href: "/privacy" },
    },
    share: "Share this product",
    copy: "Copy link",
    copied: "Link copied",
    copyPrompt: "Copy this link",
    thanks: "Thanks. We'll email you when it's ready.",
  },

  pages: {
    example: {
      published: false,
      meta: {
        title: "[Product name], Titan Wave Media",
        description: "[One line on what it does and who it is for]",
      },
      name: "[Product name]",
      line: "[One line on what it does and who it is for]",
      tag: "Coming soon",
      price: "[Price]",
      screenshot: "[Product screenshot]",
      features: [
        { icon: "tool", title: "[Feature]", text: "[What it does for you]" },
        { icon: "tool", title: "[Feature]", text: "[What it does for you]" },
        { icon: "tool", title: "[Feature]", text: "[What it does for you]" },
      ],
      who: "[Who it helps, in one or two lines]",
      steps: [
        { title: "Pay online", text: "You pay through Paystack, our payment partner. We never see your full card details." },
        { title: "Check your email", text: "Your receipt and how to get started arrive straight away." },
        { title: "Start using it", text: "[How to get started, in one line]" },
      ],
      faq: [
        {
          q: "How do I get it after I pay?",
          a: "[How buyers get access, for example an email with a download link or a sign in]",
        },
        {
          q: "Can I get a refund?",
          a: ["Yes. Our ", { link: "Refund Policy", href: "/refunds" }, " explains how it works and how long it takes."],
        },
        {
          q: "Do you keep my data?",
          a: ["Only what the product needs to work. Our ", { link: "Privacy Policy", href: "/privacy-policy" }, " has the details."],
        },
        { q: "Can I use it for my business?", a: "[What the licence allows]" },
      ],
      notifyTitle: "Get told when [Product name] launches.",
    },
  },
};

export default product;
