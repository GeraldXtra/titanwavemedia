// The Refund Policy page.
// Each section is a heading and its paragraphs. A { list: [...] } is a bulleted list, and
// { link: "Words", href: "/page" } inside a paragraph is a link.

const refunds = {
  meta: { title: "Refund Policy, Titan Wave Media", description: "When and how you can get a refund from Titan Wave Media." },
  hero: { title: "Refund Policy", updated: "Last updated 4 October 2026" },
  tocLabel: "On this page",
  sections: [
    {
      title: "Who we are",
      body: [
        "This policy is from Titan Wave Media LTD, RC {rc}, based in Lagos, Nigeria. It covers the products, projects and plans you buy from us.",
      ],
    },
    {
      title: "Products",
      body: [
        "If a product does not work as its product page describes and we cannot fix it, you can ask for a full refund within 14 days of buying it.",
      ],
    },
    {
      title: "Subscriptions",
      body: [
        "You can cancel a subscription at any time. You keep access until the end of the period you paid for. We do not give refunds for part of a period unless the law requires it.",
      ],
    },
    {
      title: "AI setup projects",
      body: [
        "Setup payments are set out in your project agreement. If you cancel before we start work, we refund the setup fee minus any costs we have already paid to others for your project, such as software or services bought for it. Once a stage has been delivered and accepted, payment for that stage is not refundable. You can end a Care plan with 30 days' notice.",
      ],
    },
    {
      title: "Synthetic data",
      body: [
        "If a dataset does not match the brief we agreed, we fix it within 7 days. If we cannot, we refund it.",
      ],
    },
    {
      title: "How to ask for a refund",
      body: [
        "Press Ask for a refund on the receipt in your console, or email {email} with your order or invoice number and what went wrong. We decide on every refund request within 5 working days. Approved refunds go back to the way you paid, and your bank or payment partner may take a few more days to show it.",
      ],
    },
    {
      title: "Your legal rights",
      body: [
        "This policy does not take away any rights you have under Nigerian consumer law or the consumer law of your country.",
      ],
    },
  ],
};

export default refunds;
