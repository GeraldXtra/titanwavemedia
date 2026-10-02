// The Terms of Service page.
// Each section is a heading and its paragraphs. A { list: [...] } is a bulleted list, and
// { link: "Words", href: "/page" } inside a paragraph is a link.

const terms = {
  meta: { title: "Terms of Service, Titan Wave Media", description: "The terms for using the Titan Wave Media website, products and services." },
  hero: { title: "Terms of Service", updated: "Last updated [DATE]" },
  tocLabel: "On this page",
  sections: [
    {
      title: "Who we are",
      body: [
        "These terms are between you and Titan Wave Media LTD, a private company limited by shares and registered with the Corporate Affairs Commission of Nigeria, RC {rc}, based in Lagos, Nigeria (\"we\", \"us\"). By using our website, buying our products or working with us, you agree to them.",
      ],
    },
    {
      title: "Using our website",
      body: [
        "Use the website lawfully. Do not try to break into it, overload it, copy it in bulk with automated tools, or use it to send spam or harmful code.",
      ],
    },
    {
      title: "Our services",
      body: [
        "AI setup, synthetic data and privacy work are each agreed in writing before we start: what we will deliver, the price and the timeline. If that agreement says something different from these terms, the agreement wins.",
      ],
    },
    {
      title: "Our products",
      body: [
        "When you buy one of our products, you get a licence to use it as described on its product page. You may not resell it, share your access, or copy, change or reverse engineer it unless the product page says you can. We may update products to fix problems or add features.",
      ],
    },
    {
      title: "Payments",
      body: [
        "Prices are shown on the product page or in your quote. Payments go through our payment partner, and we never see your full card details. Prices include any taxes we are required to charge unless we say otherwise.",
      ],
    },
    {
      title: "Refunds",
      body: [
        [
          "Refunds are covered by our ",
          { link: "Refund Policy", href: "/refunds" },
          ".",
        ],
      ],
    },
    {
      title: "Your data",
      body: [
        [
          "How we handle personal data is covered by our ",
          { link: "Privacy Policy", href: "/privacy-policy" },
          ".",
        ],
      ],
    },
    {
      title: "AI output",
      body: [
        "AI systems can make mistakes. Check important answers before you act on them, especially for money, health, legal or safety decisions. You are responsible for the decisions you make with what our systems produce.",
      ],
    },
    {
      title: "Who owns what",
      body: [
        "Our website, products, brand and the know how behind them belong to us. The data and content you give us stay yours. Who owns custom work we build for you is set out in your project agreement.",
      ],
    },
    {
      title: "Limits on our liability",
      body: [
        "We work carefully, but we cannot promise that our website or products will never be interrupted or free of errors. As far as the law allows, our total liability to you is limited to what you paid us in the 12 months before the claim. Nothing in these terms limits liability that the law does not allow us to limit.",
      ],
    },
    {
      title: "Changes to these terms",
      body: [
        "We may update these terms. The date at the top shows the latest version, and the version that applies is the one in force when you use the site or buy from us.",
      ],
    },
    {
      title: "Law",
      body: [
        "These terms are governed by the laws of the Federal Republic of Nigeria. Disputes go to the courts of Lagos State, unless the law gives you the right to use another court.",
      ],
    },
    {
      title: "Contact",
      body: [
        "Questions about these terms: email {email}.",
      ],
    },
  ],
};

export default terms;
