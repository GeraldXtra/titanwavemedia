// The home page, top to bottom.

const home = {
  meta: {
    title: "Titan Wave Media LTD, an AI company in Lagos, Nigeria",
    description: "We build AI for businesses: AI we set up for you, tools you can use today, and data that keeps your customers private.",
    shareText: "AI we set up for you, tools you can use today, and data that keeps your customers private.",
  },

  hero: {
    title: "We build AI for businesses.",
    text: "AI we set up for you, tools you can use today, and data that keeps your customers private.",
    buttons: [
      { label: "Start a project", href: "/contact?need=ai-setup", style: "solid" },
      { label: "See our products", href: "/products", style: "line" },
    ],
  },

  whatWeDo: {
    title: "Try what we can do for your business",
    text: "Four things, each one you can try right here.",

    // The restaurant chat demo.
    chat: {
      title: "AI set up for your business",
      text: "Chat assistants that answer your customers, automation that takes repeat work off your team, and AI inside the apps you already use.",
      greeting: "Hi, I am the assistant for Ade's Kitchen. Ask me about an order, our opening hours or a refund.",
      chips: [
        {
          label: "Has my order shipped?",
          question: "Has my order 4821 shipped?",
          answer: "Yes. Order 4821 left the Ikeja store this afternoon and should reach you tomorrow before 6 pm.",
        },
        {
          label: "Opening hours",
          question: "What time do you open on Sunday?",
          answer: "We open at 12 noon on Sundays and close at 9 pm.",
        },
        {
          label: "Ask for a refund",
          question: "Can I get a refund for a wrong order?",
          answer: "Yes. I have told Bisi on our team, and she will message you within the hour to sort it out.",
        },
      ],
      reset: "Start again",
      inputLabel: "Type a message",
      placeholder: "Type a message, for example: is my order ready?",
      send: "Send",
      note: "A demo assistant for a made up restaurant. It answers from a short script.",
      customer: "Customer",
      assistant: "Assistant",
      // Typed messages are matched against these words.
      script: [
        { words: ["order", "shipped", "ready", "where", "4821", "status", "delivery"], answer: "Order 4821 left the Ikeja store this afternoon and should reach you tomorrow before 6 pm." },
        { words: ["open", "hours", "time", "close", "sunday", "today"], answer: "We open at 12 noon and close at 9 pm, every day including Sunday." },
        { words: ["refund", "wrong", "complain", "cold", "missing", "bad"], answer: "Sorry about that. I have told Bisi on our team, and she will message you within the hour to sort it out." },
        { words: ["menu", "jollof", "rice", "food", "eat", "have", "price", "cost", "how much"], answer: "Tonight we have jollof rice, fried rice, pepper soup and suya. I can send the full menu with prices if you like." },
        { words: ["book", "table", "reserve", "reservation", "seat"], answer: "Yes. How many people, and what time? I will check the tables." },
        { words: ["hello", "hi", "hey", "good"], answer: "Hello. Ask me about an order, our opening hours, the menu or a booking." },
        { words: ["thanks", "thank"], answer: "You are welcome. Enjoy your meal." },
      ],
      notSure: "I am not sure about that one, so I have passed it to a person on our team. They will message you shortly.",
      foot: { label: "See AI setup", href: "/ai-setup" },
    },

    // The remove personal details demo.
    privacy: {
      title: "Your data stays private",
      text: "Paste any message. We take the personal details out before an AI model reads it.",
      label: "Message to clean",
      sample: "Hello, this is Chiamaka Eze. My transfer to account 0123456789 failed twice today. Please call me on 0803 555 0142 or email chiamaka@example.com.",
      button: "Remove personal details",
      start: "Edit the message, then press the button.",
      empty: "Nothing to clean.",
      none: "No personal details found.",
      removed: "Removed",
      // One and more than one of each kind, for the count under the button.
      kinds: {
        NAME: ["name", "names"],
        PHONE: ["phone number", "phone numbers"],
        ACCOUNT: ["account number", "account numbers"],
        EMAIL: ["email", "emails"],
      },
      foot: { label: "How we protect data", href: "/privacy" },
    },

    // The dataset maker.
    data: {
      title: "Realistic data. No real people.",
      text: "Computer generated datasets for training AI and testing software.",
      label: "Dataset",
      kinds: [
        { value: "bank", label: "Bank accounts" },
        { value: "customers", label: "Customers" },
        { value: "orders", label: "Orders" },
      ],
      button: "Make five rows",
      caption: "Sample only. Every row is made up.",
      heads: {
        bank: ["Name", "State", "Account type", "Amount (₦)", "Date"],
        customers: ["Name", "City", "Joined", "Orders", "Status"],
        orders: ["Order", "Item", "Customer", "Amount (₦)", "Status"],
      },
      rows: [
        ["Adaeze Okafor", "Lagos", "Savings", "184,500", "3 Mar 2026"],
        ["Tunde Bakare", "Oyo", "Current", "1,250,000", "17 Apr 2026"],
        ["Halima Bello", "Kano", "Domiciliary", "620,750", "9 Jun 2026"],
        ["Chidi Nwosu", "Enugu", "Savings", "42,300", "21 Jul 2026"],
        ["Funmi Adeyemi", "Abuja (FCT)", "Fixed deposit", "2,000,000", "5 Aug 2026"],
      ],
      foot: { label: "How synthetic data works", href: "/synthetic-data" },
    },

    products: {
      title: "AI tools you can use today",
      text: "Small products, each one made to fix one real problem.",
      rows: [
        { name: "[Product name]", tag: "Coming soon" },
        { name: "[Product name]", tag: "Coming soon" },
      ],
      foot: "See our products",
      href: "/products",
    },

    lagos: {
      title: "Based in Lagos. Working anywhere.",
      text: "A private company registered with the Corporate Affairs Commission, Nigeria. Tell us what you need and we reply the same day we read it.",
      foot: "Start a project",
      href: "/contact?need=ai-setup",
    },
  },

  who: {
    title: "See what AI can do for your kind of business",
    text: "Pick the kind of business you run. The plan and the example change to match.",
    tabsLabel: "Kind of business",
    note: "Example conversation. The details are made up.",
    customer: "Customer",
    assistant: "Assistant",
    sectors: [
      {
        key: "shops",
        tab: "Shops and restaurants",
        icon: "chat",
        title: "Shops and restaurants",
        text: "Orders, menus and bookings answered on WhatsApp, day and night, with the repeat work done for you.",
        list: [
          "A chat assistant that takes orders and answers questions on WhatsApp",
          "Order updates and delivery reminders sent without anyone typing them",
          "A simple view of sales and stock",
        ],
        chat: [
          ["Do you have jollof rice tonight?", "Yes, it is on the menu tonight. Delivery to Yaba takes about 40 minutes. Shall I place an order?"],
          ["Yes please, two plates.", "Done. Two plates of jollof rice, paying on delivery. The rider will message you when he leaves."],
        ],
        cta: "Start a project for my shop",
      },
      {
        key: "banks",
        tab: "Banks and fintechs",
        icon: "bank",
        title: "Banks and fintechs",
        text: "AI that works under the rules you work under. No real customer records touch a model, and nothing leaves without you knowing where it goes.",
        list: [
          "Fraud checks and reports tested on synthetic data, not customer records",
          "Records cleaned of names, phone numbers and account numbers before any AI reads them",
          "An assistant that answers account questions without ever seeing account numbers",
        ],
        chat: [
          ["Why was my transfer declined this morning?", "I can see a transfer was declined at 9:40 this morning. I have passed it to our support team, and they will call you within the hour."],
          ["Thank you.", "You are welcome. Your reference is 2210, in case you need it."],
        ],
        cta: "Start a project for my bank",
      },
      {
        key: "clinics",
        tab: "Clinics and hospitals",
        icon: "shield",
        title: "Clinics and hospitals",
        text: "Fewer missed appointments, less paperwork, and patient details kept out of AI unless they must be in.",
        list: [
          "Appointment booking and reminders on WhatsApp",
          "Patient records cleaned before AI summarises them for a doctor",
          "Reports with the names taken out",
        ],
        chat: [
          ["Can I book a follow up for next week?", "Yes. Dr Okoro has space on Tuesday at 10 am and Thursday at 2 pm. Which one works for you?"],
          ["Thursday at 2.", "Booked. You will get a reminder the day before."],
        ],
        cta: "Start a project for my clinic",
      },
      {
        key: "logistics",
        tab: "Logistics and delivery",
        icon: "auto",
        title: "Logistics and delivery",
        text: "Customers who know where their package is, and drivers who stop typing reports.",
        list: [
          "Delivery updates sent to customers automatically",
          "Driver reports written from a voice note",
          "A view of deliveries on time and late, as they happen",
        ],
        chat: [
          ["Where is my package?", "Your package left the Ikeja hub at 9:15 and is with the rider now. It should reach you before 1 pm."],
          ["Can he call me when he is close?", "Yes. I have added that to the delivery note."],
        ],
        cta: "Start a project for my fleet",
      },
    ],
  },

  how: {
    title: "From your problem to a working system in four steps",
    link: { label: "See the full process", href: "/ai-setup" },
    more: "What happens",
    close: "Close",
    steps: [
      {
        title: "Tell us the problem",
        text: "We start with the work that takes your team the most time.",
        detail: "A short call or a WhatsApp chat. You describe the job in your own words, we ask questions, and we write back what we understood so nothing gets lost.",
      },
      {
        title: "See a working demo",
        text: "You try it on real examples from your business.",
        detail: "We build a small version first, with your own examples in it. You try it, you tell us what is wrong, and only then do we agree the full build in writing.",
      },
      {
        title: "We build and connect it",
        text: "It works inside the tools you already use.",
        detail: "We connect it to WhatsApp, your website or the software you already run, test it with your team, and hand over notes written for a person.",
      },
      {
        title: "We keep it running",
        text: "Hosting, updates and fixes, every month.",
        detail: "The Care plan covers hosting, updates when things change, and fixes when they break. You message us, we handle it.",
      },
    ],
  },

  // The product cards in this block come from content/products.js.
  tools: {
    title: "AI tools you can buy and use on your own",
    link: { label: "See all products", href: "/products" },
    notify: {
      title: "Get told when our first product launches",
      thanks: "Thanks. We will email you when it is ready.",
    },
  },

  dataBlock: {
    title: "Realistic data. No real people.",
    text: "We make computer generated data you can use to train AI and test software safely.",
    buttons: [
      { label: "Talk to us about data", href: "/contact?need=data", style: "line" },
      { label: "How synthetic data works", href: "/synthetic-data", style: "line" },
    ],
  },

  privacy: {
    title: "Your data stays private",
    link: { label: "How we protect data", href: "/privacy" },
    promises: [
      {
        icon: "erase",
        text: "We remove personal details before any AI sees your data.",
        more: "Names, phone numbers, account numbers and emails come out first. The model sees the question, not the person. Try it in the box at the top of this page.",
      },
      {
        icon: "pin",
        text: "We tell you where your data goes.",
        more: "Before we start, you get a plain list: where the data is stored, which providers touch it, and who on our side can see it.",
      },
      {
        icon: "keep",
        text: "We only keep what the job needs.",
        more: "When the job ends, the rest is deleted unless we agreed to keep it. You can ask for a copy or a deletion at any time.",
      },
    ],
    strip: {
      text: "Designed around the Nigeria Data Protection Act 2023.",
      link: { label: "How we protect data", href: "/privacy" },
    },
  },

  // The tiles and posts in these blocks come from content/work.js and content/updates.js.
  work: {
    title: "See what we have built for clients",
    link: { label: "See all work", href: "/work" },
  },
  updates: {
    title: "Read what we are building and launching",
    link: { label: "All updates", href: "/updates" },
  },

  faq: {
    title: "Answers to the questions people ask first",
    items: [
      {
        q: "Do I need to understand AI to work with you?",
        a: "No. You tell us the work that eats your team's time, in plain words. We handle the technical side and explain every choice in plain words too.",
      },
      {
        q: "Where is my data stored?",
        a: "We tell you exactly where before we start, and who can see it. Personal details come out before any AI model reads your records.",
      },
      {
        q: "How long does a setup take?",
        a: "It depends on the job. You see a working demo first, and we agree the timeline in writing before any work starts.",
      },
      {
        q: "What does it cost?",
        a: "Setup is paid once and Care is paid monthly for hosting, updates and fixes. The AI Setup page has both, and every quote is written down before we begin.",
      },
    ],
  },
};

export default home;
