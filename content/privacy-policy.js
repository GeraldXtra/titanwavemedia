// The Privacy Policy page.
// Each section is a heading and its paragraphs. A { list: [...] } is a bulleted list, and
// { link: "Words", href: "/page" } inside a paragraph is a link.

const privacyPolicy = {
  meta: { title: "Privacy Policy, Titan Wave Media", description: "How Titan Wave Media collects, uses and protects personal data." },
  hero: { title: "Privacy Policy", updated: "Last updated 4 October 2026" },
  tocLabel: "On this page",
  sections: [
    {
      title: "Who we are",
      body: [
        "This policy explains how Titan Wave Media LTD, a private company limited by shares and registered with the Corporate Affairs Commission of Nigeria, RC {rc}, based in Lagos, Nigeria, handles personal data. We follow the Nigeria Data Protection Act 2023, and the data protection laws of other countries where they apply to you. Contact us at {email}.",
      ],
    },
    {
      title: "What we collect",
      body: [
        {
          list: [
            "What you send us through forms, WhatsApp or email: your name, email address, what you need and your message.",
            "Your email address if you ask to hear about a product or our updates.",
            "Order details when you buy a product: your name, email address and payment confirmation. Our payment partner handles your card or bank details.",
            "Your account details if you use the client console: your name, your business name and email address, and the time, browser and device of your last 20 sign ins. If you save a card, we keep only its type, last 4 digits, expiry date, bank and a code from Paystack, never the card number.",
            "Data that clients give us for a project, which we handle under the client's instructions and our agreement with them.",
          ],
        },
      ],
    },
    {
      title: "How we use it",
      body: [
        {
          list: [
            "To reply to you and give you what you asked for.",
            "To deliver products and services, and to send receipts.",
            "To send updates you asked for. You can stop them at any time.",
            "To keep our records and meet our legal and tax duties.",
            "To keep the website and our systems secure.",
          ],
        },
      ],
    },
    {
      title: "Our legal basis",
      body: [
        "We use personal data because you agreed to it, because we need it to carry out a contract with you, because the law requires it, or because we have a legitimate interest that does not override your rights.",
      ],
    },
    {
      title: "Client data in AI projects",
      body: [
        {
          list: [
            "We remove names, phone numbers and account details before any AI model sees your data, wherever the job allows it.",
            "We tell you where your data is stored and who can see it.",
            "We only keep what the job needs, and delete the rest when the job ends unless we agree otherwise.",
            "We do not use your data to train AI for anyone else.",
          ],
        },
      ],
    },
    {
      title: "Who we share it with",
      body: [
        "We share data only with providers that help us run the business, such as hosting, email and payments, and only under agreements that protect it. We never sell personal data. We share data with authorities only when the law requires it.",
      ],
    },
    {
      title: "Who helps us run the service",
      body: [
        {
          list: [
            "Vercel hosts the website and the console.",
            "Supabase keeps our database and signs you in.",
            "Resend sends our emails.",
            "Anthropic provides the AI model that writes the site assistant's answers.",
            "Paystack takes payments. Your card details go to Paystack, never to us.",
          ],
        },
      ],
    },
    {
      title: "Data outside Nigeria",
      body: [
        "Some of our providers store data outside Nigeria. When that happens, we use providers and agreements that keep your data protected to the standard the law requires.",
      ],
    },
    {
      title: "How long we keep it",
      body: [
        "We keep personal data only as long as we need it for the reason we collected it. Contact messages are kept for 12 months, and assistant conversations for 6 months, then deleted. Invoices and receipts are kept for [NUMBER] years, as tax law requires.",
      ],
    },
    {
      title: "Your rights",
      body: [
        {
          list: [
            "Ask for a copy of the data we hold about you.",
            "Ask us to correct it or delete it.",
            "Object to how we use it, or withdraw your consent.",
            "Ask for your data in a format you can take elsewhere.",
            "Complain to the Nigeria Data Protection Commission if you think we have handled your data wrongly.",
          ],
        },
        "To use any of these rights, email {email}. We finish every request for a copy of your data, a correction or a deletion within 30 days.",
      ],
    },
    {
      title: "Security",
      body: [
        "We encrypt data in transit, limit who can see it, and review access regularly. No system is perfectly secure, so if a breach affects you, we will tell you and the authorities as the law requires.",
      ],
    },
    {
      title: "Cookies",
      body: [
        "We use one cookie. It keeps you signed in, and the console needs it to work. We do not use advertising or tracking cookies.",
      ],
    },
    {
      title: "Children",
      body: [
        "Our website and services are not meant for anyone under 18, and we do not knowingly collect their data.",
      ],
    },
    {
      title: "Changes to this policy",
      body: [
        "We may update this policy. The date at the top shows the latest version.",
      ],
    },
  ],
};

export default privacyPolicy;
