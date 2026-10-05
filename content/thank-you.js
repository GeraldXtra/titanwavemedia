// The page people see after sending the contact form.
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

  // An optional line for people who want to follow their request in the client console.
  follow: {
    text: "Want to follow your request?",
    link: "Create a free account",
  },

  bought: {
    title: "How to get a product you bought",
    text: "Your receipt and how to get started are in your email.",
  },
};

export default thankYou;
