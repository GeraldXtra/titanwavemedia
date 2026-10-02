// The page people see after sending the contact form.
import site from "./site";

const thankYou = {
  meta: {
    title: "Thank you, Titan Wave Media",
    description: "We got your message and will reply soon.",
  },

  hero: {
    title: "Thank you.",
    text: "We got your message and will reply by email soon. If it is urgent, message us on WhatsApp.",
    buttons: [
      { label: "Chat on WhatsApp", href: site.whatsappUrl, style: "dark", icon: "wa" },
      { label: "Back to the home page", href: "/", style: "line" },
    ],
  },

  sent: {
    title: "What you sent us",
  },

  bought: {
    title: "Bought a product?",
    text: "Your receipt and how to get started are in your email.",
  },
};

export default thankYou;
