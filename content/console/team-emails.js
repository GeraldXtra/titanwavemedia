// Team view, Emails: every email the console sends, exactly as the client sees it.

const teamEmails = {
  meta: { title: "Emails, Titan Wave Media Console" },
  title: "Emails",
  lede: "Every email the console sends, and exactly what it looks like in the inbox. Each one is filled with the newest real example, or left blank when there's none yet.",
  listLabel: "Emails",
  from: "From:",
  to: "To:",
  when: "Sent when:",
  example: "Filled with: {what}",
  blank: "Nothing has happened yet that sends this email, so the details are blank.",
  frameTitle: "The {name} email",
  // A gap where a detail would go.
  gap: "____",
  examples: {
    signin: "the newest sign in link",
    welcome: "the newest account",
    invoice: "invoice {number}",
    reminder: "invoice {number}",
    receipt: "receipt {number}",
    failed: "the newest failed payment",
    project_message: "the newest reply in a project chat",
    refund_requested: "the newest refund request",
    refund_sent: "the newest refund",
    team_invite: "the newest invite",
    twostep_removed: "the newest sign in with a backup code",
    reply: "the newest reply to a message",
  },
};

export default teamEmails;
