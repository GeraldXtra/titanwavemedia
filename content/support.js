// The Support page.
// {phone} and {email} are filled in from content/site.js.

const support = {
  meta: {
    title: "Support, Titan Wave Media",
    description: "Get help from Titan Wave Media. Message us on WhatsApp or email us, and we reply the same working day.",
  },

  hero: {
    title: "Get help.",
    text: "Message us on WhatsApp or email us. We reply the same working day.",
    // The live line under it follows the time in Lagos and the working hours in content/site.js.
    open: "It is {time} in Lagos. We're open now, and we'll reply today.",
    closed: "It is {time} in Lagos. We're closed now, and we'll reply from {next}.",
    // {next} in the line above is one of these three.
    nextToday: "{time} today",
    nextTomorrow: "{time} tomorrow",
    nextLater: "{time} on {day}",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },

  reach: {
    title: "Ways to reach us",
    cards: [
      {
        icon: "wa",
        title: "WhatsApp",
        value: "{phone}",
        text: "Quick questions and anything urgent.",
        // The main button here. The chat opens with these words already typed.
        button: { label: "Message us on WhatsApp", whatsapp: "Hi Titan Wave Media, I need help with " },
      },
      {
        icon: "mail",
        title: "Email",
        value: "{email}",
        text: "Longer messages, files, refunds and data requests.",
        button: { label: "Email us", email: true },
      },
      {
        icon: "chat",
        title: "Contact form",
        text: "New projects and quotes.",
        button: { label: "Use the contact form", href: "/contact" },
      },
    ],
  },

  // If the hours change, change them here and in hours in content/site.js.
  hours: {
    title: "Our hours and our promise",
    paragraphs: [
      "Monday to Friday, 9 am to 6 pm. Saturday, 10 am to 2 pm. Closed on Sunday. All times are Lagos time.",
      "Every message gets a reply the same working day. Messages that arrive after 5 pm on a weekday, after 1 pm on Saturday, or on Sunday get their reply on the next working day.",
    ],
  },

  faster: {
    title: "Help us help you faster",
    text: "Tell us what happened, when it happened, and which page or product it was on. A screenshot helps a lot.",
  },

  urgent: {
    title: "Urgent help for Care clients",
    text: "If your assistant stops answering your customers, or your system is down, send us a WhatsApp message that starts with URGENT. We look at it within 2 working hours.",
  },

  refunds: {
    title: "Refunds",
    text: "Read our Refund Policy, then email us your receipt number and what went wrong. We reply the same working day.",
    link: { label: "Read the Refund Policy", href: "/refunds" },
  },

  data: {
    title: "Your data",
    text: "You can ask for a copy of your data, ask us to correct it, or ask us to delete it. Email us from the address you used with us. We confirm we have your request the same working day, and finish it within 30 days. We keep contact messages for 12 months and assistant conversations for 6 months, then delete them. Invoices and receipts are kept for [NUMBER] years, as tax law requires.",
    link: { label: "Read the Privacy Policy", href: "/privacy-policy" },
  },

  guide: {
    title: "Site guide",
    text: "New here? See a quick tour of every page.",
    link: { label: "Open the site guide", href: "/guide" },
  },

  faq: {
    title: "Common questions",
    items: [
      { q: "How fast do you reply?", a: "The same working day. Messages after hours get a reply on the next working day." },
      { q: "Can I call you?", a: "We work in writing on WhatsApp and email, so nothing gets lost. If a call would help, we'll book one with you." },
      { q: "Do you work with businesses outside Nigeria?", a: "Yes. We work by WhatsApp, email and video calls, on Lagos time." },
      { q: "How will I know if something is down?", a: "If something stops working, we post it on our WhatsApp status and on X straight away." },
      {
        q: "The site assistant gave me a wrong answer. What do I do?",
        a: "Send us the question you asked and the answer it gave. We'll fix it and reply with the right answer.",
      },
    ],
  },
};

export default support;
