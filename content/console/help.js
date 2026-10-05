// Help: ask for help, and the list of your requests with our replies.

const help = {
  meta: { title: "Help, Titan Wave Media Console" },
  title: "Help",
  lede: "Ask us anything about your projects, your invoices or the console. We reply here, and by email.",

  form: {
    title: "Ask for help",
    subject: "What is it about?",
    subjectPlaceholder: "For example, I can't open an invoice",
    message: "Tell us what happened",
    messageHelp: "What happened, when, and on which page. The more you tell us, the faster we can help.",
    send: "Send",
    errors: {
      subject: "Tell us what it's about.",
      message: "Tell us a little more, at least 10 characters.",
      failed: "That didn't go through. Please try again in a moment.",
    },
    done: "Sent. We'll reply here and by email.",
  },

  whatsapp: "Urgent? Message us on WhatsApp",

  list: {
    title: "Your requests",
    empty: "No requests yet. When you ask for help, it shows here with our replies.",
    subject: "Request",
    updated: "Last message",
    status: "Status",
    open: "Open",
  },

  // The three states of a request.
  status: {
    new: "New",
    replied: "Waiting on you",
    waiting: "Waiting on you",
    solved: "Solved",
  },

  ticket: {
    crumb: "Help",
    opened: "Opened on {date}",
    label: "Reply",
    placeholder: "Write a reply",
    send: "Send",
    you: "You",
    solvedNote: "We marked this as solved. Reply if you still need help, and it opens again.",
    failed: "Your reply didn't send. Please try again.",
  },
};

export default help;
