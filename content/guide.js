const guide = {
  meta: {
    title: "Site guide, Titan Wave Media",
    description: "A quick tour of every page of the Titan Wave Media website: what each page is for and what you can do there.",
  },

  hero: {
    title: "How this website works",
    text: "A quick tour of every page: what it's for and what you can do there.",
  },

  go: "Go to {page}",

  end: "This guide covers the public website. If you get stuck in your console, message us on WhatsApp and we'll help.",

  sections: [
    {
      id: "home",
      name: "Home",
      purpose: "The front door: what we do, things you can try right on the page, our products and our work, and the way to start a project.",
      links: [{ page: "Home", href: "/" }],
      shots: [
        {
          src: "/guide/home-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the home page: the header with the main links, Search, Sign in and Start a project, the black hero with the headline We build AI for businesses and the buttons Start a project and See our products, and the start of the things you can try.",
          markers: [
            { n: 1, x: 33.3, y: 13.1, to: { x: 33.3, y: 7.1 }, text: "The main links. Every page is one click away." },
            { n: 2, x: 80.8, y: 13, to: { x: 83.8, y: 6 }, text: "Sign in to your console to follow your projects and pay invoices." },
            { n: 3, x: 92, y: 13, to: { x: 92, y: 6 }, text: "Start a project. This opens the contact form." },
            { n: 4, x: 72, y: 95.3, to: { x: 86, y: 95.3 }, text: "Ask the assistant anything. It answers from this site, and a person takes over on WhatsApp when it isn't sure." },
            { n: 5, x: 40.1, y: 89.4, to: { x: 40.1, y: 93.4 }, text: "Chat with our own site assistant, right on the page." },
            { n: 6, x: 31.1, y: 51.1, to: { x: 26.1, y: 51.1 }, text: "See our products: what you can use today, and what's on the way." },
          ],
        },
        {
          src: "/guide/home-demos.webp",
          width: 1440,
          height: 900,
          alt: "The things you can try on the home page: a chat with our site assistant, a box that takes personal details out of a message, and a maker of made up data.",
          markers: [
            { n: 1, x: 18, y: 50.2, to: { x: 18, y: 40.2 }, text: "Type a question, or tap a ready one, and our assistant answers." },
            { n: 2, x: 76.3, y: 45.3, to: { x: 68.3, y: 45.3 }, text: "Paste a message, then press Remove personal details." },
            { n: 3, x: 83.2, y: 82.8, to: { x: 75.2, y: 85.8 }, text: "Pick a kind of data and make five made up rows." },
          ],
        },
        {
          src: "/guide/home-picker.webp",
          width: 1440,
          height: 900,
          alt: "The business picker on the home page: four kinds of business to choose from, what we'd set up for the one you pick, and a button to start a project.",
          markers: [
            { n: 1, x: 50, y: 28.1, to: { x: 50, y: 34.1 }, text: "Pick your kind of business to see how we'd help you." },
            { n: 2, x: 33.1, y: 67.6, to: { x: 33.1, y: 55.6 }, text: "Read the plan for that kind of business." },
            { n: 3, x: 76.2, y: 44.5, to: { x: 76.2, y: 49.5 }, text: "See what we'd set up for that business." },
            { n: 4, x: 28.2, y: 60.3, to: { x: 22.2, y: 60.3 }, text: "Start a project for that business, with your choice already filled in." },
          ],
        },
      ],
    },
    {
      id: "ai-setup",
      name: "AI Setup",
      purpose: "How we set up AI inside your business, with a builder that turns your choices into a quote request.",
      links: [{ page: "AI Setup", href: "/ai-setup" }],
      shots: [
        {
          src: "/guide/ai-setup-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the AI Setup page: the headline AI set up for your business, the Start a project button, the On this page bar and the start of the four kinds of AI we set up.",
          markers: [
            { n: 1, x: 75.4, y: 13, to: { x: 79.4, y: 6 }, text: "Search the whole site from here." },
            { n: 2, x: 18.3, y: 45.1, to: { x: 13.3, y: 45.1 }, text: "Start a project. This opens the contact form." },
            { n: 3, x: 39.7, y: 59.5, to: { x: 34.7, y: 59.5 }, text: "Jump to any part of this page from the On this page bar." },
            { n: 4, x: 50, y: 81.8, to: { x: 50, y: 87.8 }, text: "See the four kinds of AI we can set up." },
          ],
        },
        {
          src: "/guide/ai-setup-builder.webp",
          width: 1440,
          height: 900,
          alt: "The setup builder on the AI Setup page: questions with boxes to tick on the left, and on the right the setup so far and the Ask for a quote button.",
          markers: [
            { n: 1, x: 30.8, y: 35.4, to: { x: 30.8, y: 40.4 }, text: "Tick what the AI should do." },
            { n: 2, x: 62.2, y: 82.5, to: { x: 56.2, y: 82.5 }, text: "Choose where it answers and how big your team is." },
            { n: 3, x: 78.6, y: 70.9, to: { x: 78.6, y: 64.9 }, text: "Your setup updates as you tick." },
            { n: 4, x: 79.4, y: 54.6, to: { x: 73.4, y: 54.6 }, text: "Ask for a quote. The contact form opens with your setup filled in." },
          ],
        },
      ],
    },
    {
      id: "products",
      name: "Products",
      purpose: "Our AI products: what you can use today, what you can ask us for now, and what's on the way.",
      links: [{ page: "Products", href: "/products" }],
      shots: [
        {
          src: "/guide/products-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Products page: buttons to filter the products, a search box, and product cards, each with its label, what it does, its price and its buttons.",
          markers: [
            { n: 1, x: 51.5, y: 54.1, to: { x: 46.5, y: 58.1 }, text: "Filter the products by what they help with." },
            { n: 2, x: 74.2, y: 54.1, to: { x: 79.2, y: 58.1 }, text: "Search the products by name." },
            { n: 3, x: 15.6, y: 66.8, to: { x: 20.6, y: 66.8 }, text: "The label says where a product stands: Live, Available now or Coming soon." },
            { n: 4, x: 49.3, y: 99.5, to: { x: 44.3, y: 99.5 }, text: "Details opens a product's page. The button beside it opens the product, starts a talk with us, or tells you when it launches." },
          ],
        },
      ],
    },
    {
      id: "product",
      name: "A product page",
      purpose: "Everything about one product: what it does, where it stands, its price and how to get it.",
      links: [{ page: "a product page", href: "/products/wave-assist" }],
      shots: [
        {
          src: "/guide/product-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Wave Assist page: the way back to Products, the product name and what it does, its Available now label, its price line, the Talk to us button, and the start of what it does.",
          markers: [
            { n: 1, x: 4.8, y: 10.9, to: { x: 4.8, y: 16.9 }, text: "Go back to all products from here." },
            { n: 2, x: 6.9, y: 49.5, to: { x: 6.9, y: 43.5 }, text: "Where the product stands: Live, Available now or Coming soon." },
            { n: 3, x: 19.3, y: 50.1, to: { x: 19.3, y: 44.1 }, text: "Its price. For this one, we agree the price with you." },
            { n: 4, x: 40.8, y: 42, to: { x: 35.8, y: 42 }, text: "Talk to us opens the contact form with this product already picked." },
            { n: 5, x: 12, y: 78.5, to: { x: 12, y: 71.5 }, text: "What it does, in a few short lines. Questions and answers follow further down." },
          ],
        },
      ],
    },
    {
      id: "synthetic-data",
      name: "Synthetic Data",
      purpose: "Realistic data with no real people in it, and a builder that makes a sample for you to copy.",
      links: [{ page: "Synthetic Data", href: "/synthetic-data" }],
      shots: [
        {
          src: "/guide/synthetic-data-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Synthetic Data page: the headline Realistic data. No real people., the Talk to us about data button, and cards for the people who use it.",
          markers: [
            { n: 1, x: 21.7, y: 48.4, to: { x: 16.7, y: 48.4 }, text: "Talk to us about the data you need. This opens the contact form." },
            { n: 2, x: 50, y: 79.3, to: { x: 50, y: 85.3 }, text: "See who uses synthetic data, and what for." },
            { n: 3, x: 92.4, y: 85.7, to: { x: 92.4, y: 92.7 }, text: "Ask the assistant anything about synthetic data." },
          ],
        },
        {
          src: "/guide/synthetic-data-builder.webp",
          width: 1440,
          height: 900,
          alt: "The dataset builder on the Synthetic Data page: fields and a row count to choose on the left, buttons to make and copy the data, and a table of made up rows on the right.",
          markers: [
            { n: 1, x: 13.5, y: 22.2, to: { x: 8.5, y: 22.2 }, text: "Tick the fields you want in your sample." },
            { n: 2, x: 13.1, y: 71.7, to: { x: 8.1, y: 71.7 }, text: "Choose how many rows." },
            { n: 3, x: 30.9, y: 97.4, to: { x: 25.9, y: 97.4 }, text: "Make a new sample, then copy it to paste into a spreadsheet." },
            { n: 4, x: 78.6, y: 66.9, to: { x: 78.6, y: 60.9 }, text: "Your sample appears here. Every value is made up." },
          ],
        },
      ],
    },
    {
      id: "privacy",
      name: "Privacy",
      purpose: "How we keep personal details out of AI, with a tool you can try on any message.",
      links: [{ page: "Privacy", href: "/privacy" }],
      shots: [
        {
          src: "/guide/privacy-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Privacy page: the headline Your data stays private, our promises about your data, and the On this page bar.",
          markers: [
            { n: 1, x: 87.9, y: 51.7, to: { x: 87.9, y: 56.7 }, text: "Read what we promise to do with your data." },
            { n: 2, x: 40.1, y: 82.7, to: { x: 40.1, y: 77.7 }, text: "Open a promise to read more about it." },
            { n: 3, x: 33, y: 91.8, to: { x: 28, y: 91.8 }, text: "Jump to the tool from the On this page bar." },
          ],
        },
        {
          src: "/guide/privacy-demo.webp",
          width: 1440,
          height: 900,
          alt: "The tool on the Privacy page: a box to paste a message, boxes to tick for names, phone numbers, account numbers and emails, and the space where the clean copy shows.",
          markers: [
            { n: 1, x: 52.9, y: 49.8, to: { x: 46.9, y: 49.8 }, text: "Paste a message that has names or phone numbers in it." },
            { n: 2, x: 52.9, y: 73.1, to: { x: 46.9, y: 73.1 }, text: "Tick what should come out before an AI model reads it." },
            { n: 3, x: 73.9, y: 49.1, to: { x: 73.9, y: 43.1 }, text: "The clean copy shows here. Each detail that comes out is replaced by a label, like NAME." },
          ],
        },
      ],
    },
    {
      id: "work",
      name: "Work",
      purpose: "Projects we've built, each with the problem it fixes and the tools we used. Filter them by kind, or search.",
      links: [{ page: "Work", href: "/work" }],
      shots: [
        {
          src: "/guide/work-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Work page: buttons to filter projects by kind, a search box, and a project tile with a picture of the project, its name and its label.",
          markers: [
            { n: 1, x: 19.5, y: 50.6, to: { x: 14.5, y: 54.6 }, text: "Filter the projects by kind." },
            { n: 2, x: 74.2, y: 50.6, to: { x: 79.2, y: 54.6 }, text: "Search the projects." },
            { n: 3, x: 40.5, y: 70.9, to: { x: 33.5, y: 73.9 }, text: "Point at a project to see the problem it fixes and what we built. Open it to read the whole story." },
            { n: 4, x: 38.1, y: 98.3, to: { x: 32.1, y: 98.3 }, text: "The label says what kind of project it is, like our own product or client work." },
          ],
        },
      ],
    },
    {
      id: "project",
      name: "A project page",
      purpose: "One project in detail: the problem, what we built, who it was for, our role and the tools we used.",
      links: [{ page: "a project page", href: "/work/ledgerwatch" }],
      shots: [
        {
          src: "/guide/project-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the LedgerWatch project page: the way back to Work, the project name, buttons to open the app and read its code, a bar with the kind of project, who it was for, our role and where it stands, and the first picture of the app.",
          markers: [
            { n: 1, x: 3.9, y: 10.9, to: { x: 3.9, y: 16.9 }, text: "Go back to all projects from here." },
            { n: 2, x: 9.3, y: 52.3, to: { x: 9.3, y: 45.3 }, text: "Open the project, or read its code on GitHub. Both open in a new tab." },
            { n: 3, x: 50, y: 60.3, to: { x: 50, y: 65.3 }, text: "What kind of project it is, who it was for, our role and where it stands." },
            { n: 4, x: 81.6, y: 84.1, to: { x: 73.6, y: 84.1 }, text: "Pictures of the project. The story follows: the problem, what we built, who it's for and the tools we used." },
          ],
        },
      ],
    },
    {
      id: "about",
      name: "About",
      purpose: "Who builds your AI, what the company does, and its registration details.",
      links: [{ page: "About", href: "/about" }],
      shots: [
        {
          src: "/guide/about-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the About page: the headline Who builds your AI, and how we work, the On this page bar, and the start of the founder section.",
          markers: [
            { n: 1, x: 36.9, y: 62, to: { x: 31.9, y: 62 }, text: "Jump to the founder, what we do, the company details or the timeline." },
            { n: 2, x: 64.8, y: 76.2, to: { x: 58.8, y: 80.2 }, text: "Meet the founder, who designs, builds and runs your AI." },
            { n: 3, x: 22.4, y: 75.2, to: { x: 22.4, y: 80.2 }, text: "Gerald's photo goes here once it's added. Until then it shows initials." },
          ],
        },
        {
          src: "/guide/about-founder.webp",
          width: 1440,
          height: 900,
          alt: "The founder section on the About page: initials where the photo will go, Gerald's story, three parts that open and close, a line that says if Gerald is online, and buttons for WhatsApp and email.",
          markers: [
            { n: 1, x: 35.9, y: 66.3, to: { x: 41.9, y: 66.3 }, text: "Open each part to read how Gerald designs, builds and runs it." },
            { n: 2, x: 87.8, y: 77.1, to: { x: 80.8, y: 78.1 }, text: "See if Gerald is online now, or when to expect a reply." },
            { n: 3, x: 52.7, y: 92.2, to: { x: 52.7, y: 86.2 }, text: "Message Gerald on WhatsApp, with a greeting already typed." },
            { n: 4, x: 77.5, y: 83.8, to: { x: 72.5, y: 83.8 }, text: "Or send Gerald an email." },
          ],
        },
      ],
    },
    {
      id: "contact",
      name: "Contact",
      purpose: "Tell us what you need on WhatsApp, by email or through the form.",
      links: [{ page: "Contact", href: "/contact" }],
      shots: [
        {
          src: "/guide/contact-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Contact page: the headline Tell us what you need, a Chat on WhatsApp button with our email, location and the time in Lagos, and the start of the form.",
          markers: [
            { n: 1, x: 21.4, y: 47, to: { x: 21.4, y: 53 }, text: "Chat on WhatsApp. Your message starts with what you picked on the form." },
            { n: 2, x: 69.2, y: 42.9, to: { x: 69.2, y: 48.9 }, text: "Tell us about your project in the form." },
            { n: 3, x: 33, y: 95.3, to: { x: 28, y: 95.3 }, text: "Need help, not a new project? Go to Support." },
          ],
        },
        {
          src: "/guide/contact-form.webp",
          width: 1440,
          height: 900,
          alt: "The contact form: fields for your name and email, a list to pick what you need, a box for your message and the Send message button.",
          markers: [
            { n: 1, x: 69.2, y: 13.6, to: { x: 69.2, y: 18.6 }, text: "Your name and email, so we can reply." },
            { n: 2, x: 81.9, y: 29, to: { x: 81.9, y: 32.5 }, text: "Pick what you need. Extra questions appear to match." },
            { n: 3, x: 81.9, y: 41.7, to: { x: 81.9, y: 45.2 }, text: "Write your message here." },
            { n: 4, x: 59.4, y: 65.8, to: { x: 54.4, y: 65.8 }, text: "Send it, and you'll see a thank you page with what you sent." },
            { n: 5, x: 32.5, y: 60.9, to: { x: 27.5, y: 60.9 }, text: "Need help, not a new project? Go to Support." },
          ],
        },
      ],
    },
    {
      id: "updates",
      name: "Updates",
      purpose: "News about what we're building and launching, with a way to get it by email.",
      links: [{ page: "Updates", href: "/updates" }],
      shots: [
        {
          src: "/guide/updates-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Updates page: buttons to filter by kind, and a list of updates, each with a date, a title, a short summary and its kind.",
          markers: [
            { n: 1, x: 17.7, y: 58.4, to: { x: 12.7, y: 61.4 }, text: "Filter the updates by kind." },
            { n: 2, x: 34.9, y: 69.8, to: { x: 29.9, y: 69.8 }, text: "Open an update to read it in full." },
            { n: 3, x: 92.3, y: 63.7, to: { x: 94.3, y: 68.7 }, text: "Each update says what kind it is." },
          ],
        },
      ],
    },
    {
      id: "post",
      name: "An update post",
      purpose: "One update to read in full.",
      links: [{ page: "an update post", href: "/updates/meet-wave-assist" }],
      shots: [
        {
          src: "/guide/post-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of an update post: the way back to Updates, the title, the date and the writer, and the start of the post with its first heading.",
          markers: [
            { n: 1, x: 4.6, y: 10.9, to: { x: 4.6, y: 16.9 }, text: "Go back to all updates from here." },
            { n: 2, x: 25.7, y: 31.6, to: { x: 19.7, y: 31.6 }, text: "When it was posted, and who wrote it." },
            { n: 3, x: 56.2, y: 60.9, to: { x: 50.2, y: 60.9 }, text: "Read the update here." },
            { n: 4, x: 56.2, y: 71, to: { x: 50.2, y: 71 }, text: "Headings break the update into short parts." },
          ],
        },
      ],
    },
    {
      id: "support",
      name: "Support",
      purpose: "Get help, see our hours, and find out how we handle urgent problems, refunds and your data.",
      links: [{ page: "Support", href: "/support" }],
      shots: [
        {
          src: "/guide/support-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Support page: the headline Get help., a line that says if we're open now, and three ways to reach us: WhatsApp, email and the contact form.",
          markers: [
            { n: 1, x: 31.1, y: 42.8, to: { x: 31.1, y: 36.8 }, text: "See if we're open now, or when we'll reply." },
            { n: 2, x: 26.8, y: 85.3, to: { x: 22.8, y: 89.3 }, text: "Message us on WhatsApp for quick questions and anything urgent." },
            { n: 3, x: 50.9, y: 89.3, to: { x: 45.9, y: 89.3 }, text: "Email us for longer messages, files, refunds and data requests." },
            { n: 4, x: 87.3, y: 89.3, to: { x: 82.3, y: 89.3 }, text: "Use the contact form for new projects and quotes." },
          ],
        },
      ],
    },
    {
      id: "legal",
      name: "Terms, Privacy Policy and Refund Policy",
      purpose: "The terms for using our work, how we handle personal data, and how refunds work.",
      links: [{ page: "Terms", href: "/terms" }, { page: "Privacy Policy", href: "/privacy-policy" }, { page: "Refund Policy", href: "/refunds" }],
      shots: [
        {
          src: "/guide/legal-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Privacy Policy: the date it was last updated, the contents list on the left, and the policy text on the right. The Terms and the Refund Policy look the same.",
          markers: [
            { n: 1, x: 23.1, y: 26.6, to: { x: 18.1, y: 26.6 }, text: "The date it was last changed." },
            { n: 2, x: 11.8, y: 32.8, to: { x: 11.8, y: 36.8 }, text: "Jump to any part from the contents. The part you're reading is marked." },
            { n: 3, x: 85.7, y: 40.1, to: { x: 77.7, y: 46.1 }, text: "Read each part in plain words." },
          ],
        },
      ],
    },
  ],
};

export default guide;
