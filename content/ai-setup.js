// The AI Setup page.

const aiSetup = {
  meta: {
    title: "AI Setup, Titan Wave Media",
    description: "Tell us the work that eats your team's time. We build AI to handle it, connect it to your tools and keep it running.",
  },

  hero: {
    title: "AI set up for your business.",
    text: "Tell us the work that eats your team's time. We build AI to handle it, connect it to your tools and keep it running.",
    buttons: [{ label: "Start a project", href: "/contact?need=ai-setup", style: "solid" }],
  },

  // The "On this page" bar. Each id is the section it jumps to.
  subnav: [
    { id: "setup-what", label: "What we set up" },
    { id: "setup-build", label: "Build your setup" },
    { id: "setup-how", label: "How it works" },
    { id: "setup-price", label: "Pricing" },
  ],

  what: {
    title: "Four kinds of AI we can set up for you",
    cards: [
      { icon: "chat", title: "Chat assistants", text: "Answers your customers on your website and WhatsApp." },
      { icon: "auto", title: "Automation", text: "Handles repeat work like orders, reports and reminders." },
      { icon: "plug", title: "AI inside your software", text: "Connects AI to the apps you already use." },
      { icon: "dash", title: "Dashboards", text: "Shows what's happening in your business at a glance." },
    ],
  },

  build: {
    title: "Build your setup",
    text: "Tick what you need, and the summary changes as you go. When you're happy with it, ask us for a quote.",
    what: {
      legend: "What should it do?",
      options: [
        { value: "A chat assistant", label: "A chat assistant that answers customers", phrase: "a chat assistant that answers customers" },
        { value: "Automation", label: "Automation for repeat work like orders, reports and reminders", phrase: "automation for repeat work" },
        { value: "AI inside your software", label: "AI inside the software you already use", phrase: "AI inside the software we already use" },
        { value: "A dashboard", label: "A dashboard of what's happening", phrase: "a dashboard" },
      ],
    },
    where: {
      legend: "Where should it answer?",
      options: [
        { value: "WhatsApp", label: "WhatsApp", phrase: "on WhatsApp" },
        { value: "Our website", label: "Our website", phrase: "on our website" },
        { value: "WhatsApp and our website", label: "Both", phrase: "on WhatsApp and our website" },
      ],
    },
    size: {
      legend: "How big is the team?",
      options: [
        { value: "Just me", label: "Just me", phrase: "for just me" },
        { value: "2 to 10 people", label: "2 to 10 people", phrase: "for a team of 2 to 10 people" },
        { value: "More than 10 people", label: "More than 10 people", phrase: "for a team of more than 10 people" },
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
      // The message that lands in the contact form when someone presses Ask for a quote. {picks}
      // is what they picked, as one phrase. Nothing starts ticked, so only their own picks go in.
      message: "I used the setup builder on your site and I'd like a price for {picks}.",
      messageNothing: "I used the setup builder on your site and I'd like a price.",
      // When something is picked under Where or Team but nothing under What.
      setupWord: "a setup",
      and: " and ",
    },
  },

  how: {
    // What a chat assistant does, said plainly.
    example: {
      title: "What a chat assistant does",
      text: "It answers your customers on WhatsApp or your website, day and night, from what you teach it.",
      does: [
        "Answers the questions your team hears all day, like prices, opening hours and delivery areas",
        "Takes orders and bookings, and checks your records, like the status of an order",
        "Hands the chat to a person on your team when it isn't sure, so nobody gets a wrong answer",
        "Keeps every conversation, so you can see what customers ask",
      ],
    },
    title: "From your problem to a working system in four steps",
    steps: [
      { title: "Tell us the problem", text: "We start with the work that takes your team the most time." },
      { title: "See a working demo", text: "You try it on real examples from your business." },
      { title: "We build and connect it", text: "It works inside the tools you already use." },
      { title: "We keep it running", text: "Hosting, updates and fixes, every month." },
    ],
  },

  price: {
    title: "What it costs: one setup fee, then monthly care",
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
