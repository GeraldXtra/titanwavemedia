// Team view, Invoices: ask a client for money, and every invoice sent.

const teamInvoices = {
  meta: { title: "Invoices, Titan Wave Media Console" },
  title: "Invoices",
  lede: "Ask a client for money. They see it in their console straight away, and get an email with a Pay button.",

  form: {
    title: "New invoice",
    client: "Client",
    chooseClient: "Choose a client",
    noClients: "No clients yet. Invite one from Clients first.",
    project: "Project",
    noProject: "Not for a project",
    lines: "What it's for",
    line: "Line {n}",
    description: "What it's for",
    qty: "Qty",
    price: "Price in naira",
    pricePlaceholder: "Price",
    removeLine: "Remove line {n}",
    addLine: "Add a line",
    due: "Due",
    dueOptions: [
      { days: 0, label: "When they get it" },
      { days: 7, label: "In 7 days" },
      { days: 14, label: "In 14 days" },
      { days: 30, label: "In 30 days" },
    ],
    note: "Note for the client",
    notePlaceholder: "For example, thank you for your business",
    total: "Total {total}",
    send: "Send the invoice",
    errors: {
      client: "Choose a client.",
      lines: "Every line needs what it's for, and a price.",
      failed: "That didn't go through. Please try again in a moment.",
    },
    sent: "Sent to {business}. They can pay it now in their console.",
  },

  preview: {
    title: "What the client sees",
    note: "Live preview",
    number: "INV-next",
  },

  all: {
    title: "All invoices",
    number: "Invoice",
    client: "Client",
    for: "For",
    due: "Due",
    amount: "Amount",
    status: "Status",
    view: "View",
    empty: "No invoices yet.",
    deleted: "Account deleted",
  },
};

export default teamInvoices;
