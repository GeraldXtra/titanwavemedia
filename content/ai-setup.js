// The AI Setup page.

const aiSetup = {
  meta: {
    title: "AI Setup, Titan Wave Media",
    description: "Tell us the work that eats your team's time. We build AI to handle it, connect it to your tools and keep it running.",
  },

  hero: {
    title: "AI set up for your business.",
    text: "Tell us the work that eats your team's time. We build AI to handle it, connect it to your tools and keep it running.",
    buttons: [{ label: "Start a project", href: "/contact?need=ai-setup", style: "dark" }],
  },

  // The "On this page" bar. Each id is the section it jumps to.
  subnav: [
    { id: "setup-what", label: "What we set up" },
    { id: "setup-build", label: "Build your setup" },
    { id: "setup-how", label: "How it works" },
    { id: "setup-price", label: "Pricing" },
  ],

  what: {
    title: "What we set up",
    cards: [
      { icon: "chat", title: "Chat assistants", text: "Answers your customers on your website and WhatsApp." },
      { icon: "auto", title: "Automation", text: "Handles repeat work like orders, reports and reminders." },
      { icon: "plug", title: "AI inside your software", text: "Connects AI to the apps you already use." },
      { icon: "dash", title: "Dashboards", text: "Shows what is happening in your business at a glance." },
    ],
  },

  build: {
    title: "Build your setup",
    text: "Tick what you need. The summary updates as you go, and you can send it to us as a quote request.",
    what: {
      legend: "What should it do?",
      options: [
        { value: "A chat assistant", label: "A chat assistant that answers customers", checked: true },
        { value: "Automation", label: "Automation for repeat work like orders, reports and reminders" },
        { value: "AI inside your software", label: "AI inside the software you already use" },
        { value: "A dashboard", label: "A dashboard of what is happening" },
      ],
    },
    where: {
      legend: "Where should it answer?",
      options: [
        { value: "WhatsApp", label: "WhatsApp", checked: true },
        { value: "Our website", label: "Our website" },
        { value: "WhatsApp and our website", label: "Both" },
      ],
    },
    size: {
      legend: "How big is the team?",
      options: [
        { value: "Just me", label: "Just me", checked: true },
        { value: "2 to 10 people", label: "2 to 10 people" },
        { value: "More than 10 people", label: "More than 10 people" },
      ],
    },
    summary: {
      title: "Your setup",
      nothing: "Nothing ticked yet",
      answers: "Answers on {where}",
      team: "Team: {size}",
      setup: { label: "Setup", value: "{setupPrice}, paid once" },
      care: { label: "Care", value: "{carePrice} per month" },
      button: "Ask for a quote",
      note: "You get a written quote before any work starts.",
      // The message that lands in the contact form when someone asks for a quote.
      message: "I would like a quote for: {what}. It should answer on {where}. Team size: {size}.",
      messageNothing: "an AI setup",
    },
  },

  how: {
    example: {
      title: "What a chat assistant looks like",
      text: "A customer asks about an order on WhatsApp. The assistant checks your records, answers, and hands over to a person when it should.",
      customer: "Customer",
      assistant: "Assistant",
      chat: [
        { from: "customer", text: "Good evening. Has my order shipped? It is order 4821." },
        { from: "assistant", text: "Hi Tolu. Yes, order 4821 left our Ikeja store today and should reach you tomorrow." },
        { from: "customer", text: "Thank you. Can I change the delivery address?" },
        { from: "assistant", text: "I cannot change it here, so I have passed your request to Bisi on our team. She will message you shortly." },
      ],
      note: "Example conversation. The names and details are made up.",
    },
    title: "How it works",
    steps: [
      { title: "Tell us the problem", text: "We start with the work that takes your team the most time." },
      { title: "See a working demo", text: "You try it on real examples from your business." },
      { title: "We build and connect it", text: "It works inside the tools you already use." },
      { title: "We keep it running", text: "Hosting, updates and fixes, every month." },
    ],
  },

  price: {
    title: "Pricing",
    items: [
      { title: "Setup", price: "{setupPrice}", text: "Paid once." },
      { title: "Care", price: "{carePrice}", text: "Per month for hosting, updates and fixes." },
    ],
    strip: {
      text: "Every system we build follows our privacy rules.",
      link: { label: "How we protect data", href: "/privacy" },
    },
  },
};

export default aiSetup;
