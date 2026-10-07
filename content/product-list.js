const productList = {
  status: {
    live: "Live",
    available: "Available now",
    soon: "Coming soon",
  },

  price: {
    available: "Ask us for a price",
    soon: "Price at launch",
  },

  items: [
    {
      slug: "ledgerwatch",
      name: "LedgerWatch",
      icon: "bank",
      cat: "finance",
      status: "live",
      price: "Free",
      url: "https://useledgerwatch.co",
      text: "Reminders on who owes you and on the crypto markets, for small businesses and crypto holders.",
      list: [
        "Keeps track of who owes you and when it was due",
        "Sends reminders over WhatsApp or email, with your bank details already in them",
        "Closes the invoice the moment the money arrives",
        "Watches coin prices against conditions you set, and you decide whether to buy, sell or ignore it",
      ],
    },
    {
      slug: "wave-assist",
      name: "Wave Assist",
      icon: "chat",
      cat: "support",
      status: "available",
      text: "A chat assistant on your own website that answers your customers in English, day and night, from what you teach it.",
      list: [
        "Answers questions about your business from what you teach it",
        "Hands a customer over to you on WhatsApp, or takes their details, when it's not sure",
        "Shows you every conversation, and the questions it couldn't answer",
        "Goes on your website with one line of code",
      ],
      faq: [
        {
          q: "How does it go on my website?",
          a: "With one line of code. You copy it from your console and add it to your website, or send the steps to the person who looks after your website.",
        },
        {
          q: "What does it answer?",
          a: "Questions about your business, from what you teach it. It answers in English.",
        },
        {
          q: "What happens when it isn't sure?",
          a: "It hands the customer to a person on your WhatsApp, or takes their details so you can get back to them.",
        },
        {
          q: "Can I see what it tells my customers?",
          a: "Yes. You see every conversation in your console, and the questions it couldn't answer.",
        },
        {
          q: "How long are conversations kept?",
          a: ["For 6 months, then they're deleted. Our ", { link: "Privacy Policy", href: "/privacy-policy#wave-assist" }, " explains how your customers' messages are handled."],
        },
      ],
    },
    {
      slug: "wave-data",
      name: "Wave Data",
      icon: "data",
      cat: "data",
      status: "soon",
      text: "Realistic data with no real people in it, for testing apps and training AI.",
      list: ["Pick the kind of data and the fields you need", "Download it as a CSV or JSON file", "Every value is made up, so no real person is in it"],
    },
    {
      slug: "wave-clean",
      name: "Wave Clean",
      icon: "shield",
      cat: "data",
      status: "soon",
      text: "Takes names, phone numbers and account numbers out of your files, so they are safe to share or give to AI.",
      list: ["Paste text or upload a file", "Choose what to take out", "Get back a clean copy"],
    },
    {
      slug: "wave-write",
      name: "Wave Write",
      icon: "write",
      cat: "sales",
      status: "soon",
      text: "AI that writes product descriptions, Instagram captions and replies for people who sell online.",
      list: ["Write a product description from a photo and a few words", "Turn one post into captions for Instagram, WhatsApp status and X", "Draft replies to customer messages in your own tone"],
    },
    {
      slug: "wave-read",
      name: "Wave Read",
      icon: "read",
      cat: "finance",
      status: "soon",
      text: "Upload receipts, invoices or forms, and get a neat spreadsheet back.",
      list: ["Read receipts and invoices from photos or PDFs", "Put the dates, amounts and names into columns", "Download it as a spreadsheet for your accountant"],
    },
    {
      slug: "wave-voice",
      name: "Wave Voice",
      icon: "voice",
      cat: "support",
      status: "soon",
      text: "Turns WhatsApp voice notes into text and drafts a reply.",
      list: ["Turn voice notes into text", "Understands English and Nigerian Pidgin", "Drafts a reply you can send or change"],
    },
    {
      slug: "wave-insights",
      name: "Wave Insights",
      icon: "chart",
      cat: "sales",
      status: "soon",
      text: "Connect your sales, and every week get simple charts and a short summary of what changed.",
      list: ["A weekly summary of your sales in plain words", "Charts of what sold, when and where", "A heads up when something changes fast"],
    },
  ],
};

export function priceOf(item) {
  return item.price || productList.price[item.status] || "";
}

export default productList;
