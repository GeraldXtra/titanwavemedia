// Team view, Clients: who we are building for, and where each one stands.

const teamClients = {
  meta: { title: "Clients, Titan Wave Media Console" },
  title: "Clients",
  lede: "Who you're building for, where each project stands, what they've paid and what they still owe.",

  table: {
    client: "Client",
    project: "Project",
    stage: "Stage",
    paid: "Paid so far",
    owed: "Still owed",
    monthly: "Monthly",
    none: "None yet",
    nothing: "Nothing",
    noProject: "No project yet",
    stage_: "{step}, step {n} of 5",
    more: "and {count} more",
    empty: "No clients yet. Invite your first one below, or wait for someone to sign up.",
  },

  invite: {
    title: "Invite a client",
    text: "We make their account and business, and email them a welcome with a sign in link.",
    business: "Business name",
    name: "Contact name",
    email: "Email",
    button: "Invite the client",
    errors: {
      business: "Enter the business name.",
      name: "Enter the contact's name.",
      email: "Enter an email like name@business.com.",
      taken: "{email} already belongs to a business on the console.",
      failed: "That didn't go through. Please try again in a moment.",
    },
    sent: "Invited. We emailed {email} a welcome with a sign in link.",
  },
};

export default teamClients;
