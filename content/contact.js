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
    note: "Your WhatsApp message starts with what you picked on the form.",
    email: "Email",
    location: "Location",
    locationValue: "{location}",
    time: "Time in Lagos",
    timeUnit: " WAT",
    // A line under the list for people who need help rather than a new project.
    help: "Need help, not a new project?",
    helpLink: { label: "Go to Support", href: "/support" },
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
      { value: "privacy", label: "Keeping customer data private" },
      { value: "other", label: "Something else" },
    ],
    // Extra questions that show for what is picked above. Nothing starts ticked.
    // "sentence" and "phrase" are how a choice reads in the WhatsApp message.
    extra: {
      "ai-setup": {
        name: "channel",
        legend: "Where should the assistant answer?",
        options: [
          { value: "WhatsApp", label: "WhatsApp", sentence: "I'm interested in an AI assistant for my business on WhatsApp." },
          { value: "Our website", label: "Our website", sentence: "I'm interested in an AI assistant for my website." },
          { value: "Both", label: "Both", sentence: "I'm interested in an AI assistant for my website and WhatsApp." },
        ],
      },
      data: {
        name: "rows",
        legend: "Roughly how many rows?",
        options: [
          { value: "Up to 1,000 rows", label: "Up to 1,000", phrase: "about 1,000 rows" },
          { value: "Up to 100,000 rows", label: "Up to 100,000", phrase: "about 100,000 rows" },
          { value: "More than 100,000 rows", label: "More than 100,000", phrase: "more than 100,000 rows" },
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
    failed: "Your message didn't send. Please try again, or message us on WhatsApp.",
  },

  // What each choice is called in the WhatsApp message and on the thank you page.
  needWords: {
    "ai-setup": "AI setup",
    tool: "an AI tool",
    data: "synthetic data",
    privacy: "keeping customer data private",
    other: "something else",
    none: "help",
  },

  // The WhatsApp message. It uses only what the person picked or typed, as one natural message:
  // the greeting, then "I'm {name}." if they typed a name, then one sentence for what they
  // picked, then their own message exactly as they wrote it. With nothing picked or typed it is
  // only the greeting, so they write their own words.
  whatsapp: {
    greeting: "Hi Titan Wave Media, ",
    name: "I'm {name}.",
    // One sentence for what they picked. With an extra choice (above) its own sentence is used.
    need: {
      "ai-setup": "I'm interested in an AI assistant for my business.",
      data: "I need a dataset.",
      dataRows: "I need a dataset of {rows}.",
      tool: "I'm interested in one of your AI tools.",
      toolProduct: "I'm interested in {product}.",
      privacy: "I need help keeping my customers' details private when we use AI.",
      other: "",
    },
  },

  // Put in the message box when someone arrives from "Start a project for my shop" and the like
  // on the home page, after picking their kind of business there.
  sectorMessages: {
    shops: "I run a shop or restaurant.",
    banks: "I work for a bank or fintech.",
    clinics: "I run a clinic or hospital.",
    logistics: "I run a logistics or delivery business.",
  },

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
