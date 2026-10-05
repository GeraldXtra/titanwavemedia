// Team view, Log: what the team did, newest first.

const teamLog = {
  meta: { title: "Log, Titan Wave Media Console" },
  title: "Log",
  lede: "What the team did: invoices sent, refunds, steps changed and members added. Newest first.",
  when: "When",
  who: "Who",
  what: "What",
  empty: "Nothing yet.",
  // The words for each action. {target} is what it was about.
  actions: {
    invoice_sent: "Sent invoice {target}",
    reminder_sent: "Sent a reminder for {target}",
    refund_approved: "Approved a refund on {target}",
    refund_declined: "Declined a refund on {target}",
    step_changed: "Moved {target} to step {n}, {step}",
    quote_sent: "Sent a quote for {target}",
    client_invited: "Invited the client {target}",
    member_added: "Added {target} to the team",
    member_removed: "Removed {target} from the team",
  },
};

export default teamLog;
