// Every email the console sends. The Team view's Emails page lists them in this order.
//
// Each email is a subject, a preview line (the grey text after the subject in an inbox) and a
// list of blocks:
// - { p: "..." } a paragraph. **Words between double stars** are bold.
// - { box: [["Label", "value"], ...] } a small table of details.
// - { quote: "..." } someone's message, in a box.
// - { button: "Label" } the one red button. It opens the email's link.
// - { link: "..." } a line with the link written out, for pasting.
// {Words in curly brackets} are filled in when the email is sent. {first} is the person's first
// name, {phone} our WhatsApp number, {rc} our RC number.

const emails = {
  // The bottom of every email.
  footer: "Titan Wave Media LTD, RC {rc}, Lagos, Nigeria.",
  reason: "You got this email because you have an account with Titan Wave Media.",
  logoAlt: "Titan Wave Media",
  // Who the email is from, when the sender's own name is not known.
  team: "Titan Wave Media",
  // When the person's first name is not known.
  firstFallback: "there",

  templates: {
    signin: {
      name: "Sign in link",
      when: "When someone asks to sign in",
      subject: "Your sign in link for Titan Wave Media",
      preview: "Press the button to sign in. The link works for 15 minutes.",
      blocks: [
        { h: "Sign in to Titan Wave Media" },
        { p: "Someone asked to sign in with **{email}**. If that was you, press the button. It works once, for the next 15 minutes." },
        { button: "Sign in" },
        { link: "Or paste this link into your browser: {url}" },
        { box: [["Asked from", "{device}"], ["At", "{time}, Lagos time"]] },
        { p: "If this wasn't you, ignore this email. Nobody can sign in without this link." },
      ],
      reason: "You got this email because someone typed this address on our sign in page.",
    },

    welcome: {
      name: "Welcome",
      when: "After the first sign in, or when we invite a client",
      subject: "Welcome to Titan Wave Media",
      preview: "Your account is ready. Here's where to start.",
      blocks: [
        { h: "Welcome, {first}" },
        { p: "Your account for **{business}** is ready. Here's where to start:" },
        { box: [["1", "Add your business details"], ["2", "Turn on two step sign in"], ["3", "Start a project, or follow the one we're building for you"]] },
        { button: "Open your console" },
        { p: "Questions? Reply to this email, or message us on WhatsApp at {phone}." },
      ],
    },

    invoice: {
      name: "New invoice",
      when: "When we send an invoice",
      subject: "New invoice {number} from Titan Wave Media: {amount}, due {due}",
      preview: "View it and pay by card, bank transfer or USSD.",
      blocks: [
        { h: "You have a new invoice" },
        { p: "Hi {first}, here's your invoice for **{title}**." },
        { box: [["Invoice", "{number}"], ["Amount", "{amount}"], ["Due", "{due}"]] },
        { button: "View and pay" },
        { p: "You can pay by card, bank transfer or USSD." },
      ],
    },

    reminder: {
      name: "Invoice reminder",
      when: "3 days before an invoice is due, on the day, 3 days after, or when we press Send a reminder",
      subject: "Reminder: {number} for {amount} is due on {due}",
      // The subject for the reminder on the due date, and for one sent after it.
      subjectToday: "Reminder: {number} for {amount} is due today",
      subjectLate: "Reminder: {number} for {amount} was due on {due}",
      preview: "A friendly reminder about your invoice.",
      blocks: [
        { h: "A friendly reminder" },
        { p: "Hi {first}, invoice **{number}** for **{title}** is due on **{due}**." },
        { box: [["Amount", "{amount}"], ["Due", "{due}"]] },
        { button: "View and pay" },
        { p: "Already paid? Thank you, and please ignore this email." },
      ],
    },

    receipt: {
      name: "Receipt",
      when: "After every payment that goes through",
      subject: "Receipt for your payment of {amount}",
      preview: "Thank you. Your receipt {number} is ready.",
      blocks: [
        { h: "Thank you for your payment" },
        { p: "We received **{amount}** for **{title}**." },
        { box: [["Receipt", "{number}"], ["Paid on", "{date}"], ["Paid with", "{method}"], ["Reference", "{reference}"]] },
        { button: "View your receipt" },
        { p: "Keep this email for your records." },
      ],
    },

    failed: {
      name: "Payment didn't go through",
      when: "When a bank declines a payment",
      subject: "Your payment of {amount} didn't go through",
      preview: "Nothing was taken from your account.",
      blocks: [
        { h: "Your payment didn't go through" },
        { p: "Your bank declined the payment with your **{method}**. Nothing was taken from your account." },
        { box: [["Invoice", "{number}"], ["Amount", "{amount}"]] },
        { button: "Pay now" },
        { p: "You can try another card, or pay by bank transfer or USSD." },
      ],
    },

    project_message: {
      name: "Project message",
      when: "When we reply in a project chat",
      subject: "{who} replied about {project}",
      preview: "{text}",
      blocks: [
        { h: "New message about your project" },
        { p: "**{who}** wrote about **{project}**:" },
        { quote: "{text}" },
        { button: "Reply in your console" },
      ],
    },

    refund_requested: {
      name: "Refund request received",
      when: "When a client asks for a refund",
      subject: "We got your refund request",
      preview: "We decide on every refund request within 5 working days.",
      blocks: [
        { h: "We got your refund request" },
        { p: "You asked for a refund of **{amount}** for **{title}**. We decide on every refund request within 5 working days, as our Refund Policy says." },
        { box: [["Receipt", "{number}"], ["Reason", "{reason}"]] },
        { button: "View your receipt" },
      ],
    },

    refund_sent: {
      name: "Refund sent",
      when: "When a refund has gone back to the client",
      subject: "Your refund of {amount} is on its way",
      preview: "We sent it back the way you paid.",
      blocks: [
        { h: "Your refund is on its way" },
        { p: "We sent **{amount}** for **{title}** back the way you paid. Your bank may take a few working days to show it." },
        { box: [["Receipt", "{number}"], ["Refunded", "{amount}"], ["Reference", "{reference}"]] },
        { button: "View your receipt" },
      ],
    },

    team_invite: {
      name: "Team invite",
      when: "When someone is added to a business, or to our team",
      subject: "{inviter} added you to {team} on Titan Wave Media",
      preview: "Press the button to sign in. The link works for 15 minutes.",
      blocks: [
        { h: "You're invited" },
        { p: "**{inviter}** added you to **{team}** on Titan Wave Media. Press the button to sign in. It works once, for the next 15 minutes." },
        { button: "Sign in" },
        { p: "Has the link run out? Go to {signin} and type **{email}** to get a new one." },
      ],
      reason: "You got this email because someone added this address to their team on Titan Wave Media.",
    },

    twostep_removed: {
      name: "Two step sign in was removed",
      when: "When someone signs in with a backup code",
      subject: "Two step sign in was removed from your account",
      preview: "You signed in with a backup code, so two step sign in is now off.",
      blocks: [
        { h: "Two step sign in is off" },
        { p: "You signed in with a backup code on **{time}**, Lagos time, so we turned off two step sign in. Turn it on again to get a new set of backup codes." },
        { button: "Turn it on again" },
        { p: "If this wasn't you, press Sign out of all devices in Settings, Security, and message us on WhatsApp at {phone}." },
      ],
    },

    reply: {
      name: "Reply to a message",
      when: "When we reply to a contact message, a quote request, a help ticket, a refund request or feedback",
      subject: "{who} replied to your message",
      preview: "{text}",
      blocks: [
        { h: "We replied to your message" },
        { p: "**{who}** wrote:" },
        { quote: "{text}" },
        { button: "Open your console" },
        { p: "You can also reply to this email." },
      ],
      // Contact form messages from people without an account get no button.
      noAccount: "You can reply to this email.",
      reason: "You got this email because you wrote to Titan Wave Media.",
    },
  },
};

export default emails;
