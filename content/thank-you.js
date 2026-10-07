import site from "./site";

const thankYou = {
  meta: {
    title: "Thank you, Titan Wave Media",
    description: "We got your message, and we'll reply the same working day.",
  },

  hero: {
    title: "Thank you. Your message reached us.",
    text: "We got your message, and we'll reply by email the same working day. If it's urgent, message us on WhatsApp.",
    buttons: [
      { label: "Chat on WhatsApp", href: site.whatsappUrl, style: "line", icon: "wa" },
      { label: "Back to the home page", href: "/", style: "line" },
    ],
  },

  sent: {
    title: "What you sent us",
  },

  follow: {
    text: "Want to follow your request?",
    link: "Create a free account",
  },

  bought: {
    title: "Asked about a product?",
    text: "We'll reply with how to get it and what it costs. When you pay us, you get a receipt.",
  },
};

export default thankYou;
