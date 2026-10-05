// The About page.

const about = {
  meta: {
    title: "About, Titan Wave Media",
    description: "We're an AI company in Lagos, Nigeria. We build AI systems, tools and data for businesses here and around the world.",
  },

  hero: {
    title: "Who builds your AI, and how we work.",
    text: "We're an AI company in Lagos, Nigeria. We build AI systems, tools and data for businesses here and around the world.",
  },

  // The "On this page" bar. Each id is the section it jumps to.
  subnav: [
    { id: "about-founder", label: "Founder" },
    { id: "about-what", label: "What we do" },
    { id: "about-details", label: "Company details" },
    { id: "about-timeline", label: "Timeline" },
  ],

  // The founder. To add a photo, put it in the public folder and its address in photo, for
  // example "/gerald.jpg". Until then the slot shows the initials.
  founder: {
    photo: "",
    initials: "EG",
    name: "Eberechukwu Gerald",
    role: "Founder",
    story:
      "I'm Gerald, the founder of Titan Wave Media. I've been building websites and apps since 2024, and I started this company to bring AI to businesses that need it but don't know where to start. I design it, I build it, and I keep it running.",
    // The three parts that open and close, one at a time.
    parts: [
      { title: "I design it", text: "I plan with you how it should work and what it should look like, before anything gets built." },
      { title: "I build it", text: "I build it, connect it to the tools you already use, and test it on your own examples." },
      { title: "I keep it running", text: "I host it, update it and fix it, so it keeps working while you run your business." },
    ],
    // The live line under the parts follows the working hours in content/site.js. {time} is the
    // time in Lagos, and it updates every minute.
    open: "It's {time} in Lagos. I'm online, and I usually reply the same day.",
    closed: "It's {time} in Lagos. I'm away right now, and I'll reply from {next}.",
    // {next} in the line above is one of these three.
    nextToday: "{time} today",
    nextTomorrow: "{time} tomorrow",
    nextLater: "{time} on {day}",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    whatsapp: { label: "Message me on WhatsApp", start: "Hi Gerald, " },
    email: { label: "Email me" },
  },

  what: {
    title: "Four things we can do for your business",
    cards: [
      { icon: "dash", title: "AI setup", text: "We set up AI that works inside your business." },
      { icon: "tool", title: "AI tools", text: "We build tools anyone can use." },
      { icon: "shield", title: "Privacy", text: "We keep personal details out of AI." },
      { icon: "data", title: "Synthetic data", text: "We make realistic data with no real people in it." },
    ],
  },

  details: {
    title: "Check our company details",
    text: "Titan Wave Media LTD. Private company registered with the Corporate Affairs Commission, Nigeria.",
    items: [
      { label: "Registered name", value: "Titan Wave Media LTD" },
      { label: "Registration number", value: "RC {rc}" },
      { label: "Company type", value: "Private company limited by shares" },
      { label: "Registered", value: "1 April 2026" },
      { label: "Registered with", value: "Corporate Affairs Commission, Nigeria" },
      { label: "Based in", value: "Lagos, Nigeria" },
    ],
  },

  timeline: {
    title: "What we've done so far, and what comes next",
    // "since" counts the days from that date to today; {days} shows the count.
    items: [
      {
        date: "1 April 2026",
        datetime: "2026-04-01",
        title: "Registered",
        text: "Titan Wave Media LTD was certified by the Corporate Affairs Commission as a private company. That was {days} days ago.",
        since: "2026-04-01",
      },
      { date: "[DATE]", title: "[First product launches]", text: "[One line about it]" },
      { date: "[DATE]", title: "[Next milestone]", text: "[One line about it]" },
    ],
  },
};

export default about;
