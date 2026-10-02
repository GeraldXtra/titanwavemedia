// The Contact page and its form.

const contact = {
  meta: {
    title: "Contact, Titan Wave Media",
    description: "Tell us what you need. Send a message on WhatsApp, email us, or fill in the form.",
  },

  hero: {
    title: "Tell us what you need.",
    text: "Send a message on WhatsApp, email us, or fill in the form.",
  },

  side: {
    whatsapp: "Chat on WhatsApp",
    note: "The message opens with what you picked on the form.",
    email: "Email",
    location: "Location",
    locationValue: "{location}",
    time: "Time in Lagos",
    timeUnit: " WAT",
  },

  form: {
    honeypot: "Company",
    name: "Name",
    email: "Email",
    need: "What do you need?",
    needs: [
      { value: "", label: "Choose one" },
      { value: "ai-setup", label: "AI setup" },
      { value: "tool", label: "An AI tool" },
      { value: "data", label: "Synthetic data" },
      { value: "other", label: "Something else" },
    ],
    // Extra questions that show for what is picked above. The first option starts ticked.
    extra: {
      "ai-setup": {
        name: "channel",
        legend: "Where should the assistant answer?",
        options: [
          { value: "WhatsApp", label: "WhatsApp" },
          { value: "Our website", label: "Our website" },
          { value: "Both", label: "Both" },
        ],
      },
      data: {
        name: "rows",
        legend: "Roughly how many rows?",
        options: [
          { value: "Up to 1,000 rows", label: "Up to 1,000" },
          { value: "Up to 100,000 rows", label: "Up to 100,000" },
          { value: "More than 100,000 rows", label: "More than 100,000" },
        ],
      },
      tool: {
        name: "product",
        legend: "Which product?",
        options: [
          { value: "[Product name]", label: "[Product name]" },
          { value: "Not sure yet", label: "Not sure yet" },
        ],
      },
    },
    message: "Message",
    submit: "Send message",
    note: ["We only use your details to reply to you. Read our ", { link: "Privacy Policy", href: "/privacy-policy" }, "."],
    errors: {
      name: "Enter your name.",
      email: "Enter your email address.",
      emailFormat: "Enter an email address like name@company.com.",
      need: "Choose what you need.",
      message: "Tell us a little more, at least 10 characters.",
    },
    failed: "Your message did not send. Please try again, or message us on WhatsApp.",
  },

  // What each choice is called in the WhatsApp message and on the thank you page.
  needWords: {
    "ai-setup": "AI setup",
    tool: "an AI tool",
    data: "synthetic data",
    other: "something else",
    none: "help",
  },

  // The WhatsApp message carries what was picked on the form.
  whatsapp: {
    start: "Hi Titan Wave Media. I need {need}.",
    channel: "It should answer on {channel}.",
    rows: "{rows}.",
    product: "Product: {product}.",
  },

  // Filled into the message when someone arrives from "Start a project for my shop" and the like.
  sectorMessage: "I run a business in this area: {sector}. ",

  // The list on the thank you page.
  summary: {
    need: "What you need",
    channel: "Answers on",
    rows: "Size",
    product: "Product",
    name: "Name",
    email: "Email",
  },
};

export default contact;
