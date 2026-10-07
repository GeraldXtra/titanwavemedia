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
    title: "What we promise to do with your data",
    items: [
      { icon: "erase", text: "We remove names, phone numbers and account details before any AI model sees your data." },
      { icon: "pin", text: "We tell you where your data is stored and who can see it." },
      { icon: "keep", text: "We only keep what the job needs, and delete the rest." },
      { icon: "trash", text: "You can ask us to delete your data at any time." },
    ],
  },

  subnav: [
    { id: "priv-promises", label: "Our promises" },
    { id: "priv-demo", label: "See it work" },
    { id: "priv-tools", label: "For organisations" },
  ],

  demo: {
    title: "Take personal details out of a message",
    text: "Paste a message and tick what should come out before an AI model reads it. Nothing you paste leaves this page.",
    legend: "Remove",
    kinds: [
      { value: "NAME", label: "Names" },
      { value: "PHONE", label: "Phone numbers" },
      { value: "ACCOUNT", label: "Account numbers" },
      { value: "EMAIL", label: "Emails" },
    ],
    label: "Message to clean",
    placeholder: "Paste a message that has names or phone numbers in it",
    cleanLabel: "The clean copy",
    empty: "Paste a message first. The clean copy shows here, with the details you tick taken out.",
    none: "We didn't find any personal details in this message.",
  },

  tools: {
    title: "Privacy tools for your organisation",
    text: "We clean personal details out of your records so your team can use AI safely.",
    button: { label: "Talk to us", href: "/contact?need=privacy" },
    policyLink: { label: "Read our full Privacy Policy", href: "/privacy-policy" },
  },
};

export default privacy;
