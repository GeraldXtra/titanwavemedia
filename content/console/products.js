// The products in the console. None of them works in the console yet: each shows Coming soon
// with Notify me, and every Notify me counts on the Team view's Product interest page, together
// with the website's notify list (a website sign up from a product page with the same slug).

const products = {
  meta: { title: "Products, Titan Wave Media Console" },
  title: "Products",
  lede: "AI tools for your business. They're on the way. Tell us which ones you want, and we'll email you the day each one opens.",
  soon: "Coming soon",
  notify: "Notify me",
  notified: "We'll tell you",
  notifiedHelp: "We email you the day it opens.",
  doneOn: "Done. We'll email you when {name} opens.",
  doneOff: "We won't tell you about {name}.",
  open: "See what it will do",
  whatTitle: "What it will do",
  wantTitle: "Want it?",
  wantText: "Tell us, and we'll email you the day it opens. The products people ask for most get built first.",
  back: "Products",

  items: [
    {
      slug: "wave-assist",
      name: "Wave Assist",
      icon: "chat",
      text: "A chat assistant that answers your customers on your website, and later on WhatsApp, day and night.",
      list: ["Answers questions about your business from what you teach it", "Hands a customer over to your team when it's not sure", "Shows you every conversation it has"],
    },
    {
      slug: "wave-data",
      name: "Wave Data",
      icon: "data",
      text: "Realistic data with no real people in it, for testing apps and training AI.",
      list: ["Pick the kind of data and the fields you need", "Download it as a CSV or JSON file", "Every value is made up, so no real person is in it"],
    },
    {
      slug: "wave-clean",
      name: "Wave Clean",
      icon: "shield",
      text: "Takes names, phone numbers and account numbers out of your files, so they are safe to share or give to AI.",
      list: ["Paste text or upload a file", "Choose what to take out", "Get back a clean copy"],
    },
    {
      slug: "wave-write",
      name: "Wave Write",
      icon: "write",
      text: "AI that writes product descriptions, Instagram captions and replies for people who sell online.",
      list: ["Write a product description from a photo and a few words", "Turn one post into captions for Instagram, WhatsApp status and X", "Draft replies to customer messages in your own tone"],
    },
    {
      slug: "wave-read",
      name: "Wave Read",
      icon: "read",
      text: "Upload receipts, invoices or forms, and get a neat spreadsheet back.",
      list: ["Read receipts and invoices from photos or PDFs", "Put the dates, amounts and names into columns", "Download it as a spreadsheet for your accountant"],
    },
    {
      slug: "wave-voice",
      name: "Wave Voice",
      icon: "voice",
      text: "Turns WhatsApp voice notes into text and drafts a reply.",
      list: ["Turn voice notes into text", "Understands English and Nigerian Pidgin", "Drafts a reply you can send or change"],
    },
    {
      slug: "wave-insights",
      name: "Wave Insights",
      icon: "chart",
      text: "Connect your sales, and every week get simple charts and a short summary of what changed.",
      list: ["A weekly summary of your sales in plain words", "Charts of what sold, when and where", "A heads up when something changes fast"],
    },
  ],
};

export default products;
