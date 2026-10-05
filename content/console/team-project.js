// Team view, one client's project: move it through the steps, send the quote, post updates,
// share files and chat.

const teamProject = {
  crumb: "Clients",
  for: "For {business}",
  open: "Open the project",

  step: {
    title: "Step",
    label: "Move to step",
    button: "Move it",
    live: "Moving to step 5, Live and care, sends the invoice for the second half of the setup and starts the monthly Care invoices.",
    moved: "Moved to step {n}, {step}. The client can see it now.",
    same: "It's already at that step.",
  },

  next: {
    title: "What happens next",
    help: "The client sees this on their project. Leave it empty to show the usual words for the step.",
    save: "Save",
    saved: "Saved.",
  },

  quote: {
    title: "Send a quote",
    setup: "Setup price in naira",
    setupHelp: "Paid in two halves: when they accept, and when it goes live.",
    care: "Care price a month in naira",
    careHelp: "0 for no Care.",
    summary: "What it covers",
    send: "Send the quote",
    sent: "Quote sent. They can accept it in their console.",
    current: "The last quote: {setup} to build, {care} a month. {status}",
    states: { sent: "Waiting for them.", accepted: "Accepted.", changes: "They asked for changes.", withdrawn: "Withdrawn." },
    errors: { setup: "Enter the setup price, more than 0.", care: "Enter the Care price, or 0." },
  },

  update: {
    title: "Post an update",
    label: "Update",
    placeholder: "For example, the assistant now reads your full menu",
    send: "Post it",
    sent: "Posted. The client sees it in their updates.",
  },

  chat: {
    title: "Chat with {business}",
  },
};

export default teamProject;
