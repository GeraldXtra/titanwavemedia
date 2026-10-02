// The Privacy page.

const privacy = {
  meta: {
    title: "Privacy, Titan Wave Media",
    description: "Your data stays private. Every AI system we build follows the same rules, for a small shop or a bank.",
  },

  hero: {
    title: "Your data stays private.",
    text: "Every AI system we build follows the same rules, for a small shop or a bank.",
  },

  promises: {
    title: "Our promises",
    items: [
      { icon: "erase", text: "We remove names, phone numbers and account details before any AI model sees your data." },
      { icon: "pin", text: "We tell you where your data is stored and who can see it." },
      { icon: "keep", text: "We only keep what the job needs, and delete the rest." },
      { icon: "trash", text: "You can ask us to delete your data at any time." },
    ],
  },

  // The "On this page" bar. Each id is the section it jumps to.
  subnav: [
    { id: "priv-promises", label: "Our promises" },
    { id: "priv-demo", label: "See it work" },
    { id: "priv-tools", label: "For organisations" },
  ],

  demo: {
    title: "See it work",
    text: "Tick what should come out of a message before any AI model reads it, and watch it happen.",
    legend: "Remove",
    kinds: [
      { value: "NAME", label: "Names" },
      { value: "PHONE", label: "Phone numbers" },
      { value: "ACCOUNT", label: "Account numbers" },
      { value: "EMAIL", label: "Emails" },
    ],
    removed: "Personal details removed.",
    original: "Original shown.",
    label: "Customer message",
    example: "Example, every detail is made up",
    // The parts marked with a kind are the personal details that can be taken out.
    message: [
      "Hello, this is ",
      { kind: "NAME", text: "Chiamaka Eze" },
      ". My transfer to account ",
      { kind: "ACCOUNT", text: "0123456789" },
      " failed twice today. Please call me on ",
      { kind: "PHONE", text: "0803 555 0142" },
      " or email ",
      { kind: "EMAIL", text: "chiamaka@example.com" },
      ".",
    ],
  },

  tools: {
    title: "Privacy tools for your organization",
    text: "We clean personal details out of your records so your team can use AI safely.",
    button: { label: "Talk to us", href: "/contact?need=other" },
    policyLink: { label: "Read our full Privacy Policy", href: "/privacy-policy" },
  },
};

export default privacy;
