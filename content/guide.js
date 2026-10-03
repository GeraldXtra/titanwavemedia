// The site guide at /guide: a short tour of every page.
//
// The screenshots in public/guide/ show the pages as they looked when they were taken. Retake
// them after any design change; a prompt asking for new screenshots is enough.
//
// Each screenshot lists its markers: the number, where the square sits (x and y, as a
// percentage of the screenshot's width and height), where its arrow ends (to.x and to.y, the
// same way), and the words in the list beside it.

const guide = {
  meta: {
    title: "Site guide, Titan Wave Media",
    description: "A quick tour of every page of the Titan Wave Media website: what each page is for and what you can do there.",
  },

  hero: {
    title: "How this website works",
    text: "A quick tour of every page: what it is for and what you can do there.",
  },

  // The button under each part. {page} is the page name.
  go: "Go to {page}",

  end: "The client console guide comes with client accounts.",

  sections: [
    {
      id: "home",
      name: "Home",
      purpose: "The front door: what we do, live demos you can try, and the way to start a project.",
      links: [{ page: "Home", href: "/" }],
      shots: [
        {
          src: "/guide/home-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the home page: the header with the main links, Search and Start a project, the black hero with the headline We build AI for businesses, and the start of the live demos.",
          markers: [
            { n: 1, x: 33, y: 13, to: { x: 33, y: 7.9 }, text: "The main links. Every page is one click away." },
            { n: 2, x: 92.5, y: 14, to: { x: 92.5, y: 6.7 }, text: "Start a project. This opens the contact form." },
            { n: 3, x: 78, y: 85, to: { x: 84.3, y: 91.2 }, text: "Ask the assistant anything. It answers from this site, and a person takes over on WhatsApp when it is not sure." },
            { n: 4, x: 40, y: 70, to: { x: 40, y: 75.7 }, text: "Try a chat assistant like the ones we build for businesses." },
          ],
        },
        {
          src: "/guide/home-demos.webp",
          width: 1440,
          height: 900,
          alt: "The live demos on the home page: a chat assistant for a made up restaurant, a box that takes personal details out of a message, and a maker of made up data.",
          markers: [
            { n: 1, x: 35, y: 94.5, to: { x: 35, y: 85.1 }, text: "Type a question, or tap a ready one, to see how the assistant replies." },
            { n: 2, x: 78, y: 46.6, to: { x: 68.3, y: 46.6 }, text: "Edit the message, then press Remove personal details." },
            { n: 3, x: 88, y: 81.5, to: { x: 75.3, y: 86.3 }, text: "Pick a kind of data and make five made up rows." },
          ],
        },
        {
          src: "/guide/home-picker.webp",
          width: 1440,
          height: 900,
          alt: "The business picker on the home page: four kinds of business to choose from, the plan for the one picked, and an example conversation.",
          markers: [
            { n: 1, x: 48, y: 27, to: { x: 48, y: 33.3 }, text: "Pick your kind of business to see how we would help you." },
            { n: 2, x: 49, y: 65, to: { x: 45.5, y: 65.4 }, text: "Read the plan for that kind of business." },
            { n: 3, x: 93, y: 46, to: { x: 93, y: 51.1 }, text: "Watch an example conversation for that business." },
            { n: 4, x: 31, y: 78.2, to: { x: 23.8, y: 78.2 }, text: "Start a project for that business, with your choice already filled in." },
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
            { n: 1, x: 80, y: 13, to: { x: 84, y: 6.6 }, text: "Search the whole site from here." },
            { n: 2, x: 20, y: 41.6, to: { x: 14.4, y: 41.6 }, text: "Start a project. This opens the contact form." },
            { n: 3, x: 44, y: 55.2, to: { x: 36.4, y: 55.2 }, text: "Jump to any part of this page from the On this page bar." },
            { n: 4, x: 50, y: 74, to: { x: 50, y: 81.4 }, text: "See the four kinds of AI we can set up." },
          ],
        },
        {
          src: "/guide/ai-setup-builder.webp",
          width: 1440,
          height: 900,
          alt: "The setup builder on the AI Setup page: questions with boxes to tick on the left, and on the right the setup so far, its price and the Ask for a quote button.",
          markers: [
            { n: 1, x: 35, y: 34.4, to: { x: 35, y: 41.2 }, text: "Tick what the AI should do." },
            { n: 2, x: 66, y: 90, to: { x: 57.3, y: 88 }, text: "Choose where it answers and how big your team is." },
            { n: 3, x: 92, y: 39.5, to: { x: 92, y: 44.2 }, text: "Your setup and its price update as you tick." },
            { n: 4, x: 82, y: 77.7, to: { x: 74.4, y: 77.7 }, text: "Ask for a quote. The contact form opens with your setup filled in." },
          ],
        },
      ],
    },
    {
      id: "products",
      name: "Products",
      purpose: "The AI tools we are making, which you can use on your own once they launch.",
      links: [{ page: "Products", href: "/products" }],
      shots: [
        {
          src: "/guide/products-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Products page: buttons to filter the tools, a search box, and product cards marked Coming soon, each with Details and Notify me buttons.",
          markers: [
            { n: 1, x: 37, y: 47.5, to: { x: 29.6, y: 51.8 }, text: "Filter the tools by what they help with." },
            { n: 2, x: 72, y: 47.5, to: { x: 78.5, y: 51.8 }, text: "Search the tools by name." },
            { n: 3, x: 26, y: 72, to: { x: 26, y: 65 }, text: "Coming soon means the tool is not out yet." },
            { n: 4, x: 26, y: 83.5, to: { x: 18.9, y: 83.5 }, text: "Details opens the page for that tool, and Notify me tells you when it launches." },
          ],
        },
      ],
    },
    {
      id: "product",
      name: "A product page",
      purpose: "Everything about one tool: what it does, how to get it, and a form to hear when it launches.",
      links: [{ page: "a product page", href: "/products/example" }],
      shots: [
        {
          src: "/guide/product-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of a product page: the way back to Products, the product name, its Coming soon label, its price, and the Notify me and Ask a question buttons.",
          markers: [
            { n: 1, x: 22, y: 18, to: { x: 16.8, y: 18 }, text: "Go back to all products from here." },
            { n: 2, x: 14.4, y: 46, to: { x: 14.4, y: 39.7 }, text: "The price, once it is set." },
            { n: 3, x: 23, y: 46, to: { x: 23, y: 40.4 }, text: "Notify me takes you to a form to hear when it launches." },
            { n: 4, x: 46, y: 37, to: { x: 40.7, y: 37 }, text: "Ask us a question about this tool." },
            { n: 5, x: 50, y: 54, to: { x: 50, y: 58 }, text: "A picture of the tool goes here." },
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
            { n: 1, x: 24, y: 44.6, to: { x: 18.2, y: 44.6 }, text: "Talk to us about the data you need. This opens the contact form." },
            { n: 2, x: 50, y: 74, to: { x: 50, y: 78.7 }, text: "See who uses synthetic data, and what for." },
            { n: 3, x: 90, y: 84, to: { x: 90, y: 91 }, text: "Ask the assistant anything about synthetic data." },
          ],
        },
        {
          src: "/guide/synthetic-data-builder.webp",
          width: 1440,
          height: 900,
          alt: "The dataset builder on the Synthetic Data page: fields and a row count to choose on the left, buttons to make and copy the data, and a table of made up rows on the right.",
          markers: [
            { n: 1, x: 66, y: 72, to: { x: 57.3, y: 60 }, text: "Tick the fields you want in your sample." },
            { n: 2, x: 66, y: 80, to: { x: 57.3, y: 80 }, text: "Choose how many rows." },
            { n: 3, x: 34, y: 94, to: { x: 26.7, y: 94 }, text: "Make a new sample, then copy it to paste into a spreadsheet." },
            { n: 4, x: 80, y: 72, to: { x: 80, y: 62.7 }, text: "Your sample appears here. Every value is made up." },
          ],
        },
      ],
    },
    {
      id: "privacy",
      name: "Privacy",
      purpose: "How we keep personal details out of AI, with a live demo you can try.",
      links: [{ page: "Privacy", href: "/privacy" }],
      shots: [
        {
          src: "/guide/privacy-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Privacy page: the headline Your data stays private, our promises about your data, and the On this page bar.",
          markers: [
            { n: 1, x: 50, y: 56, to: { x: 44, y: 61.6 }, text: "Read what we promise to do with your data." },
            { n: 2, x: 25, y: 88, to: { x: 25, y: 83.3 }, text: "Open a promise to read more about it." },
            { n: 3, x: 40, y: 90, to: { x: 29.7, y: 93.4 }, text: "Jump to the live demo from the On this page bar." },
          ],
        },
        {
          src: "/guide/privacy-demo.webp",
          width: 1440,
          height: 900,
          alt: "The live demo on the Privacy page: boxes to tick for names, phone numbers, account numbers and emails, and a customer message with those details taken out.",
          markers: [
            { n: 1, x: 58, y: 62, to: { x: 47.8, y: 62 }, text: "Tick what should come out of a message before an AI model reads it." },
            { n: 2, x: 75, y: 52, to: { x: 75, y: 43.7 }, text: "Watch the details come out as you tick." },
            { n: 3, x: 62, y: 48, to: { x: 62.3, y: 38.4 }, text: "Each detail that comes out is replaced by a label, like NAME." },
          ],
        },
      ],
    },
    {
      id: "work",
      name: "Work",
      purpose: "Sites, apps and AI systems we have built, which you can filter and search.",
      links: [{ page: "Work", href: "/work" }],
      shots: [
        {
          src: "/guide/work-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Work page: buttons to filter projects, a search box, and project tiles with a picture and a name.",
          markers: [
            { n: 1, x: 31, y: 45, to: { x: 25.3, y: 48.9 }, text: "Filter the projects by kind." },
            { n: 2, x: 72, y: 45, to: { x: 78.5, y: 49.1 }, text: "Search the projects." },
            { n: 3, x: 45, y: 52, to: { x: 33.5, y: 57 }, text: "Point at a project to see what we built and the result." },
            { n: 4, x: 22, y: 89.6, to: { x: 14.3, y: 89.6 }, text: "Open a project to read the whole story." },
          ],
        },
      ],
    },
    {
      id: "project",
      name: "A project page",
      purpose: "One project in detail: the problem, what we built, how we handled the data and what changed.",
      links: [{ page: "a project page", href: "/work/example" }],
      shots: [
        {
          src: "/guide/project-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of a project page: the way back to Work, the project name, a bar with the client, the industry, the year and what we built, and a picture of the project.",
          markers: [
            { n: 1, x: 20, y: 18, to: { x: 14.7, y: 18 }, text: "Go back to all projects from here." },
            { n: 2, x: 50, y: 46, to: { x: 50, y: 49.7 }, text: "Who it was for, the kind of business, the year and what we built." },
            { n: 3, x: 30, y: 70, to: { x: 42, y: 78 }, text: "A picture of the project goes here." },
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
            { n: 1, x: 40, y: 46.7, to: { x: 33.5, y: 46.7 }, text: "Jump to the founder, what we do, the company details or the timeline." },
            { n: 2, x: 75, y: 58, to: { x: 67, y: 64.1 }, text: "Meet the founder, who designs, builds and runs your AI." },
            { n: 3, x: 22, y: 57, to: { x: 22, y: 64.1 }, text: "His photo goes here once it is added. Until then it shows his initials." },
          ],
        },
        {
          src: "/guide/about-founder.webp",
          width: 1440,
          height: 900,
          alt: "The founder section on the About page: his initials where the photo will go, his story, three parts that open and close, a line that says if he is online, and buttons for WhatsApp and email.",
          markers: [
            { n: 1, x: 88, y: 62, to: { x: 80, y: 65.3 }, text: "Open each part to read how he designs, builds and runs it." },
            { n: 2, x: 86, y: 80, to: { x: 80, y: 80 }, text: "See if he is online now, or when he will reply." },
            { n: 3, x: 53, y: 94, to: { x: 53, y: 89.2 }, text: "Message him on WhatsApp, with a greeting already typed." },
            { n: 4, x: 80, y: 86, to: { x: 74.2, y: 86 }, text: "Or send him an email." },
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
            { n: 1, x: 21.5, y: 42.5, to: { x: 21.5, y: 49.5 }, text: "Chat on WhatsApp. The message opens with what you picked on the form." },
            { n: 2, x: 69, y: 42.5, to: { x: 69, y: 45.6 }, text: "Tell us about your project in the form." },
            { n: 3, x: 34, y: 91.8, to: { x: 29.4, y: 91.8 }, text: "Need help, not a new project? Go to Support." },
          ],
        },
        {
          src: "/guide/contact-form.webp",
          width: 1440,
          height: 900,
          alt: "The contact form: fields for your name and email, a list to pick what you need, a box for your message and the Send message button.",
          markers: [
            { n: 1, x: 60, y: 12.2, to: { x: 60, y: 16 }, text: "Your name and email, so we can reply." },
            { n: 2, x: 60, y: 24.5, to: { x: 60, y: 27.4 }, text: "Pick what you need. Extra questions appear to match." },
            { n: 3, x: 60, y: 37, to: { x: 60, y: 40.8 }, text: "Write your message here." },
            { n: 4, x: 62, y: 62.6, to: { x: 55, y: 62.6 }, text: "Send it. You then see a thank you page with what you sent." },
            { n: 5, x: 34, y: 55, to: { x: 29.4, y: 55 }, text: "Need help, not a new project? Go to Support." },
          ],
        },
      ],
    },
    {
      id: "updates",
      name: "Updates",
      purpose: "News about what we are building and launching, with a way to get it by email.",
      links: [{ page: "Updates", href: "/updates" }],
      shots: [
        {
          src: "/guide/updates-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of the Updates page: buttons to filter by kind, and a list of updates, each with a date, a title, a short summary and its kind.",
          markers: [
            { n: 1, x: 36, y: 52, to: { x: 29.3, y: 54.7 }, text: "Filter the updates by kind." },
            { n: 2, x: 40, y: 65.4, to: { x: 24.1, y: 65.4 }, text: "Open an update to read it in full." },
            { n: 3, x: 86, y: 58, to: { x: 90.9, y: 63.6 }, text: "Each update says what kind it is." },
          ],
        },
      ],
    },
    {
      id: "post",
      name: "An update post",
      purpose: "One update to read in full.",
      links: [{ page: "an update post", href: "/updates/example" }],
      shots: [
        {
          src: "/guide/post-top.webp",
          width: 1440,
          height: 900,
          alt: "The top of an update post: the way back to Updates, the title, the date and the writer, and the start of the post with a picture.",
          markers: [
            { n: 1, x: 19, y: 18, to: { x: 14.1, y: 18 }, text: "Go back to all updates from here." },
            { n: 2, x: 21, y: 29.8, to: { x: 14.4, y: 29.8 }, text: "When it was posted, and who wrote it." },
            { n: 3, x: 60, y: 56, to: { x: 53.6, y: 56 }, text: "Read the update here." },
            { n: 4, x: 60, y: 70, to: { x: 51.1, y: 70 }, text: "Pictures sit between the paragraphs." },
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
          alt: "The top of the Support page: the headline Get help., a line that says if we are open now, and three ways to reach us: WhatsApp, email and the contact form.",
          markers: [
            { n: 1, x: 42, y: 33.4, to: { x: 36.6, y: 33.4 }, text: "See if we are open now, or when we will reply." },
            { n: 2, x: 28.6, y: 79.5, to: { x: 24.1, y: 83.1 }, text: "Message us on WhatsApp for quick questions and anything urgent." },
            { n: 3, x: 53, y: 86.2, to: { x: 46.7, y: 86.2 }, text: "Email us for longer messages, files, refunds and data requests." },
            { n: 4, x: 89, y: 86.2, to: { x: 83.6, y: 86.2 }, text: "Use the contact form for new projects and quotes." },
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
            { n: 1, x: 19, y: 25.5, to: { x: 14.1, y: 25.5 }, text: "The date it was last changed." },
            { n: 2, x: 11.8, y: 29.5, to: { x: 11.8, y: 34.1 }, text: "Jump to any part from the contents. The part you are reading is marked." },
            { n: 3, x: 90, y: 41.5, to: { x: 80, y: 47.5 }, text: "Read each part in plain words." },
          ],
        },
      ],
    },
  ],
};

export default guide;
