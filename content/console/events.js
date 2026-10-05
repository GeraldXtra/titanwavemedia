// The lines in Recent activity on the console home, and in the bell. Each event is kept with a
// short name and its details, and shown with the words below. {Words in curly brackets} are the
// details: {project}, {number}, {amount}, {name}, {email}, {who}, {business}, {subject}, {step}.

const events = {
  // Recent activity on the client's home page.
  activity: {
    account_created: "You created your account",
    member_joined: "{email} joined your team",
    member_invited: "You invited {email} to your team",
    member_removed: "{email} was removed from your team",
    twostep_on: "Two step sign in was turned on",
    twostep_off: "Two step sign in was turned off",
    twostep_removed: "Two step sign in was turned off after a backup code was used",
    business_updated: "Your business details were updated",
    project_requested: "You asked for a new project: {project}",
    file_sent: "You sent a file: {name}",
    file_team: "We added a file to {project}: {name}",
    quote_sent: "Your quote for {project} is ready",
    quote_accepted: "You accepted the quote for {project}",
    quote_changes: "You asked for changes to the quote for {project}",
    step_changed: "{project} moved to step {n}, {step}",
    invoice_new: "New invoice {number} for {amount}",
    payment_ok: "{amount} paid for {number}",
    payment_failed: "A payment for {number} didn't go through",
    card_saved: "{card} was saved",
    card_removed: "{card} was removed",
    autopay_on: "Automatic payments for Care were turned on",
    autopay_off: "Automatic payments for Care were turned off",
    refund_requested: "You asked for a refund on {number}",
    refund_done: "Your refund of {amount} on {number} is done",
    refund_declined: "Your refund request on {number} was declined",
    ticket_opened: "You asked for help: {subject}",
    product_interest: "You asked to hear about {name}",
    // A message sent through the website before the account was made.
    message: "You sent us a message from the website",
    quote_request: "You asked us for a quote from the website",
  },

  // The bell. Clients see the first list, the team the second.
  client: {
    invoice_new: "New invoice {number} for {amount}",
    invoice_reminder: "Reminder: {number} for {amount} is due on {date}",
    payment_ok: "Payment received for {number}. Your receipt is ready.",
    payment_failed: "Your payment for {number} didn't go through",
    reply_project: "{who} replied about {project}",
    reply_help: "We replied to your help request: {subject}",
    reply_refund: "We replied about your refund request on {number}",
    reply_feedback: "We replied to your feedback",
    quote_sent: "Your quote for {project} is ready",
    step_changed: "{project} moved to step {n}, {step}",
    file_team: "We added a file to {project}",
    refund_received: "We got your refund request for {number}",
    refund_done: "Your refund of {amount} on {number} is done",
    refund_declined: "Your refund request on {number} was declined",
  },
  team: {
    new_contact: "New message from {who}",
    new_quote: "{who} asked for a quote",
    new_project: "{business} asked for a new project: {project}",
    project_message: "New message from {business} about {project}",
    new_ticket: "{business} asked for help: {subject}",
    ticket_message: "{business} replied about {subject}",
    new_refund: "{business} asked for a refund of {amount}",
    new_feedback: "New feedback: {subject}",
    payment_in: "{business} paid {amount}",
    payment_review: "A payment for {number} needs checking: Paystack took a different amount",
    double_payment: "{number} was paid twice. Refund one of the payments.",
    quote_accepted: "{business} accepted the quote for {project}",
    quote_changes: "{business} asked for changes to the quote for {project}",
    file_client: "{business} sent a file: {name}",
    autopay_failed: "The automatic payment for {number} didn't go through",
    refund_failed: "The refund on {number} didn't go through at Paystack",
  },

  // The names of the 5 steps, used in the lines above and on the project pages.
  steps: ["First call", "Plan and quote", "Build", "Test with your team", "Live and care"],
};

export default events;
