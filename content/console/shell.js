// The console around every page: the top bar, the side menu, the search, the bell, the account
// menu, the footer, and its windows (the legal pages, feedback and system status).

const shell = {
  brand: "Titan Wave Media",
  tag: "Console",
  homeLabel: "Console home",
  skip: "Skip to content",
  titleEnd: ", Titan Wave Media Console",
  // The browser tab, when a page has no title of its own.
  title: "Titan Wave Media Console",

  menu: "Open the menu",
  menuClose: "Close the menu",
  sideLabel: "Console",

  views: {
    label: "Whose view",
    client: "Client",
    team: "Team",
    more: " view",
  },

  // The side menu for clients. `count: "due"` shows how many invoices are waiting to be paid.
  clientNav: [
    { items: [{ label: "Home", href: "/console", icon: "home", exact: true }] },
    {
      title: "Your account",
      items: [
        { label: "Projects", href: "/console/projects", icon: "folder" },
        { label: "Billing", href: "/console/billing", icon: "card", count: "due" },
        { label: "Help", href: "/console/help", icon: "chat" },
        { label: "Settings", href: "/console/settings", icon: "gear" },
      ],
    },
    // The products come from content/console/products.js, each marked with `soon`.
    { title: "Products", products: true },
  ],
  soon: "Soon",

  // The side menu in Team view. `count: "inbox"` shows how many messages wait for a reply.
  // `owner: true` shows only to the owner.
  teamNav: [
    {
      title: "Titan Wave team",
      items: [
        { label: "Inbox", href: "/console/team/inbox", icon: "inbox", count: "inbox" },
        { label: "Payments", href: "/console/team/payments", icon: "bank" },
        { label: "Invoices", href: "/console/team/invoices", icon: "read" },
        { label: "Clients", href: "/console/team/clients", icon: "users" },
        { label: "Product interest", href: "/console/team/interest", icon: "chart" },
        { label: "Emails", href: "/console/team/emails", icon: "mail" },
        { label: "Team", href: "/console/team/members", icon: "users", owner: true },
        { label: "Log", href: "/console/team/log", icon: "write" },
      ],
    },
  ],

  signOut: "Sign out",

  search: {
    label: "Search the console",
    placeholder: "Search pages",
    empty: "Nothing matches. Try \"invoice\" or \"settings\".",
    client: [
      { label: "Home", href: "/console", icon: "home" },
      { label: "Projects", href: "/console/projects", icon: "folder" },
      { label: "Start a new project", href: "/console/projects/new", icon: "plus" },
      { label: "Products", href: "/console/products", icon: "data" },
      { label: "Billing", href: "/console/billing", icon: "card" },
      { label: "Invoices", href: "/console/billing?tab=invoices", icon: "read" },
      { label: "Payments and receipts", href: "/console/billing?tab=payments", icon: "card" },
      { label: "Saved cards", href: "/console/billing?tab=methods", icon: "card" },
      { label: "Automatic payments", href: "/console/billing?tab=methods", icon: "card" },
      { label: "Help", href: "/console/help", icon: "chat" },
      { label: "Settings", href: "/console/settings", icon: "gear" },
      { label: "Your details", href: "/console/settings", icon: "gear" },
      { label: "Two step sign in", href: "/console/settings?tab=security", icon: "lock" },
      { label: "Sign in history", href: "/console/settings?tab=security", icon: "lock" },
      { label: "Email settings", href: "/console/settings?tab=notifications", icon: "bell" },
      { label: "Your team", href: "/console/settings?tab=team", icon: "users" },
      { label: "Download your data", href: "/console/settings?tab=data", icon: "download" },
      { label: "Delete your account", href: "/console/settings?tab=data", icon: "close" },
    ],
    team: [
      { label: "Inbox", href: "/console/team/inbox", icon: "inbox" },
      { label: "Payments", href: "/console/team/payments", icon: "bank" },
      { label: "Payouts", href: "/console/team/payments", icon: "bank" },
      { label: "Invoices", href: "/console/team/invoices", icon: "read" },
      { label: "New invoice", href: "/console/team/invoices", icon: "plus" },
      { label: "Clients", href: "/console/team/clients", icon: "users" },
      { label: "Invite a client", href: "/console/team/clients", icon: "plus" },
      { label: "Product interest", href: "/console/team/interest", icon: "chart" },
      { label: "Emails", href: "/console/team/emails", icon: "mail" },
      { label: "Team", href: "/console/team/members", icon: "users" },
      { label: "Log", href: "/console/team/log", icon: "write" },
    ],
  },

  bell: {
    label: "Notifications",
    labelCount: "Notifications, {n} new",
    title: "Notifications",
    readAll: "Mark all as read",
    empty: "Nothing new.",
  },

  account: {
    label: "Account",
    settings: "Settings",
    billing: "Billing",
    team: "Titan Wave Media",
  },

  footer: {
    label: "Console footer",
    feedback: "Feedback",
    whatsapp: "Help on WhatsApp",
    // The message the WhatsApp chat opens with.
    whatsappText: "Hi Titan Wave Media, I need help with my console. ",
    ok: "All systems working",
    bad: "Something isn't working. We're on it.",
    checking: "Checking",
    copyright: "© {year} Titan Wave Media LTD. RC {rc}. Lagos, Nigeria.",
    privacy: "Privacy",
    terms: "Terms",
    refunds: "Refunds",
    cookies: "Cookie preferences",
  },

  legal: {
    title: "Privacy, terms and cookies",
    // {date} is the date on the Privacy Policy.
    updated: "{updated}. The same pages are on our website.",
    tabs: { privacy: "Privacy Policy", terms: "Terms of Service", refunds: "Refund Policy", cookies: "Cookies" },
    cookiesText: "We only use the cookies the console needs to work. One of them keeps you signed in. We don't use advertising or tracking cookies.",
    needed: "Needed to work",
    neededHelp: "They keep you signed in and keep your account safe. Always on.",
    remember: "Remember my choices",
    rememberHelp: "Things like the tab you last opened, on this device only.",
    save: "Save my choices",
    saved: "Saved. We only use the cookies the console needs.",
  },

  feedback: {
    title: "Send feedback",
    text: "Tell us what is broken, what is confusing, or what you wish the console did. We read every message.",
    kind: "What is it about?",
    kinds: ["Something is broken", "An idea", "A question", "Something else"],
    message: "Your message",
    send: "Send",
    cancel: "Cancel",
    short: "Write a few words first.",
    thanks: "Thank you. We read every message.",
  },

  status: {
    title: "System status",
    checked: "Checked at {time}, Lagos time",
    working: "Working",
    notWorking: "Not working",
    checks: { database: "Accounts and the database", payments: "Payments through Paystack" },
    note: "If something stops working, we say so here and on our WhatsApp status straight away.",
  },

  close: "Close",
  failed: "That didn't go through. Please try again in a moment.",
};

export default shell;
