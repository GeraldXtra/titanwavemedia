const project = {
  kinds: {
    client: "Client work",
    product: "Our product",
    school: "School project",
    team: "Team project",
  },

  labels: {
    crumb: "Work",
    kind: "Type of project",
    next: "Next project",
    share: "Share this project",
    copy: "Copy link",
    copied: "Link copied",
    copyPrompt: "Copy this link",
  },

  cta: {
    title: "Tell us what you want built.",
    buttons: [{ label: "Start a project", href: "/contact?need=ai-setup", style: "line" }],
  },

  pages: {
    ledgerwatch: {
      published: true,
      kind: "product",
      meta: {
        title: "LedgerWatch project, Titan Wave Media",
        description: "Our own app for businesses that sell on credit. It chases the money they're owed, and watches coin prices for people who hold crypto.",
      },
      name: "LedgerWatch",
      card: "An app that keeps track of who owes a business money, sends the reminders, and watches coin prices.",
      needed: "Money a business has already earned sits unpaid, because nobody chased it.",
      built: "An app that sends the reminders, closes each invoice when the money arrives, and watches coin prices.",
      line: "Our own app for businesses that sell on credit. It chases the money they're owed, and watches coin prices for people who hold crypto.",
      links: [
        { label: "Open LedgerWatch", href: "https://useledgerwatch.co" },
        { label: "Read the code on GitHub", href: "https://github.com/GeraldXtra/ledgerwatch" },
      ],
      facts: [
        { label: "Built for", value: "Businesses in Lagos and across Nigeria" },
        { label: "Our role", value: "Sole builder" },
        { label: "Status", value: "Live and free to use" },
      ],
      cover: {
        src: "/work/ledgerwatch/cover.webp",
        small: "/work/ledgerwatch/cover-683.webp",
        width: 1366,
        height: 1025,
        alt: "The top of LedgerWatch's front page. The headline reads \"Get paid what you are owed, without chasing anyone yourself.\" Beside it is a sample list of four open invoices and the total owed. Below are cards for Receivables, Crypto payments and Market Watch.",
      },
      shots: [
        {
          src: "/work/ledgerwatch/feature-1.webp",
          small: "/work/ledgerwatch/feature-1-590.webp",
          width: 1180,
          height: 720,
          alt: "LedgerWatch's Receivables page. Four tiles show what is outstanding, how many accounts are overdue, what was collected this month, and the rate of everything invoiced. Below them are two bar charts: money invoiced against money collected over six months, and how long balances have been waiting.",
        },
        {
          src: "/work/ledgerwatch/feature-2.webp",
          small: "/work/ledgerwatch/feature-2-590.webp",
          width: 1180,
          height: 666,
          alt: "LedgerWatch's Market Watch page in paper trading mode. A simulated portfolio shows its total value, and four tiles show cash, total profit or loss, active watches, and alerts waiting for approval.",
        },
      ],
      stories: [
        {
          title: "The problem",
          text: "A business that sells on credit finishes the work and sends the invoice. Then someone has to remember to follow it up. Often nobody does, so money that was already earned just sits there. The customer didn't refuse to pay. Nobody chased it.",
        },
        {
          title: "What we built",
          text: [
            "LedgerWatch keeps track of who owes you and when it was due. It writes the reminders and sends them over WhatsApp or email, with your bank details already in them. It takes part payments as they arrive, and stops chasing the moment an invoice is paid. A customer can pay by bank transfer, or in a dollar stablecoin to an address made for that one invoice, and the invoice closes by itself once the payment confirms.",
            "Market Watch watches coin prices against conditions you set. When one is met, it tells you what happened and suggests what to do. Then it waits for you.",
            "The rule behind it is simple: the software prepares, and a person approves. Reminders wait for you unless you choose to let them send themselves. Trading starts in paper mode, with a simulated portfolio that follows real prices. The wallet's keys are made in your own browser and locked with your password, so the server can never spend from it.",
          ],
        },
        {
          title: "Who it's for",
          text: "Small businesses in Lagos and across Nigeria that sell on credit: a distributor, a contractor, a supplier, anyone who does the work first and gets paid later. Amounts are in naira. Market Watch is for people who hold crypto.",
        },
        {
          title: "Our role",
          text: "Gerald, our founder, built all of it alone.",
        },
        {
          title: "Tools we used",
          text: "Node, Express and MongoDB on the server. React and Vite in the browser, with ethers for the blockchain work. An AI model handles the writing and the conversation, with a plain template behind each, so the app keeps working when the AI is unavailable.",
        },
      ],
    },
  },
};

export default project;
