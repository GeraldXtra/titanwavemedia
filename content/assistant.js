// The site assistant at the bottom right of every page.
// How the assistant behaves with the AI model is set out in content/assistant-rules.md.

const assistant = {
  open: "Ask us anything",
  title: "Titan Wave Media assistant",
  subtitle: "Answers from what is on this site",
  close: "Close the chat",
  chips: ["What do you do?", "How much does it cost?", "Is my data safe?", "Talk to a person"],
  inputLabel: "Your message",
  placeholder: "Type your question",
  send: "Send",
  note: "A simple assistant that answers from this site. On the live site it will be connected to a real model, with the same privacy rules.",
  greeting: "Hello. I am the Titan Wave Media assistant. Ask me about what we do, prices, privacy, synthetic data, or how to reach us.",
  you: "You",
  bot: "Assistant",
  whatsappLink: "Continue on WhatsApp",
  // The start of the WhatsApp message that carries the visitor's question.
  whatsappStart: "Hi Titan Wave Media. ",
  // Shown when one visitor sends more than 30 messages in an hour.
  busy: "You have sent a lot of messages in the last hour, so I have to stop here for now. Please try again later, or ask a person on WhatsApp.",

  // The scripted answers, used when the AI model is switched off or does not reply.
  // A question is matched against the words; {time} is the time in Lagos.
  // An answer that is a list picks one at random.
  brain: [
    {
      words: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "start"],
      answer: "Hello. Ask me about AI setup, our tools, synthetic data, privacy, prices, or how to reach us.",
    },
    {
      words: ["what do you do", "services", "what is this", "about", "company", "who are you", "titan"],
      answer: "We build AI for businesses: AI we set up for you, tools you can use today, and data that keeps your customers private. Titan Wave Media LTD is a private company registered with the Corporate Affairs Commission, Nigeria, based in Lagos.",
      link: { label: "About", href: "/about" },
    },
    {
      words: ["setup", "set up", "chat assistant", "assistant", "automation", "automate", "dashboard", "whatsapp bot", "bot", "integrate", "inside my software"],
      answer: "AI setup means we build AI to handle the work that eats your team's time, connect it to your tools and keep it running: chat assistants, automation, dashboards and AI inside the software you already use. You see a working demo before the full build.",
      link: { label: "Build your setup", href: "/ai-setup" },
    },
    {
      words: ["price", "prices", "cost", "how much", "pay", "fee", "pricing", "quote", "expensive", "cheap"],
      answer: "Setup is paid once ({setupPrice}) and Care is paid monthly ({carePrice}) for hosting, updates and fixes. Every quote is written down before any work starts. You can build your setup on the AI Setup page and send it to us as a quote request.",
      link: { label: "Build your setup", href: "/ai-setup" },
    },
    {
      words: ["privacy", "private", "safe", "secure", "security", "data protection", "ndpa", "personal", "gdpr", "delete my data", "where is my data"],
      answer: "We remove names, phone numbers and account details before any AI model sees your data, we tell you where it is stored and who can see it, we only keep what the job needs, and you can ask us to delete your data at any time. The work is designed around the Nigeria Data Protection Act 2023.",
      link: { label: "How we protect data", href: "/privacy" },
    },
    {
      words: ["synthetic", "dataset", "datasets", "fake data", "test data", "generated data", "training data", "sample data"],
      answer: "Synthetic data is computer generated data that looks and behaves like real data, with no real people in it. Teams use it to train AI and test software without exposing anyone's details. You can build a sample on the Synthetic Data page.",
      link: { label: "Build a sample dataset", href: "/synthetic-data" },
    },
    {
      words: ["product", "products", "tools", "buy", "launch", "app", "subscription", "download"],
      answer: "Our first products are on the way. Leave your email on the Products page and we will tell you when the first one is ready.",
      link: { label: "See our products", href: "/products" },
    },
    {
      words: ["contact", "email", "phone", "call", "whatsapp", "reach", "talk to a person", "human", "someone", "person", "speak"],
      answer: "You can message us on WhatsApp, email us at {email}, or fill in the form on the Contact page. It is {time} in Lagos right now.",
      link: { label: "Contact", href: "/contact" },
      whatsapp: true,
    },
    {
      words: ["where", "location", "lagos", "nigeria", "address", "office", "country", "time"],
      answer: "We are in Lagos, Nigeria, and we work with businesses anywhere. It is {time} in Lagos right now.",
      link: { label: "About", href: "/about" },
    },
    {
      words: ["how long", "timeline", "when", "duration", "weeks", "days", "fast", "quick"],
      answer: "It depends on the job. You see a working demo first, and we agree the timeline in writing before any work starts.",
      link: { label: "How it works", href: "/ai-setup" },
    },
    {
      words: ["refund", "money back", "cancel", "return"],
      answer: "If a product does not work as described and we cannot fix it, you can ask for a full refund within [NUMBER] days. Subscriptions can be cancelled any time, and setup payments follow your project agreement.",
      link: { label: "Refund Policy", href: "/refunds" },
    },
    {
      words: ["work", "portfolio", "clients", "projects", "examples", "case study", "case studies"],
      answer: "Our Work page shows sites, apps and AI systems we have built for clients. You can filter it by AI setup, products and data.",
      link: { label: "See our work", href: "/work" },
    },
    {
      words: ["shop", "restaurant", "bank", "fintech", "clinic", "hospital", "logistics", "delivery", "school", "church", "hotel"],
      answer: "We build for shops and restaurants, banks and fintechs, clinics and hospitals, and logistics companies, and for any business with repeat work and customers to answer. Pick your kind of business on the home page to see a plan.",
      link: { label: "Who we build for", href: "/" },
    },
    {
      words: ["thanks", "thank you", "great", "ok", "okay", "cool", "nice"],
      answer: [
        "You are welcome. Anything else?",
        "Glad to help. Ask me anything else about what we do.",
      ],
    },
  ],
  notOnSite: "I do not have that on this site yet. You can ask a person on WhatsApp, or try: what we do, prices, privacy, synthetic data, or how to contact us.",
};

export default assistant;
