// Team view, Team: the people who work in the Titan Wave Media team view. Only the owner
// (OWNER_EMAIL) can add or remove them.

const teamMembers = {
  meta: { title: "Team, Titan Wave Media Console" },
  title: "Team",
  lede: "The people who can open Team view: the inbox, payments, invoices and clients. Only you can add or remove them.",

  // In the invite email: "{inviter} added you to {team} on Titan Wave Media".
  teamName: "the Titan Wave Media team",

  form: {
    title: "Add a team member",
    label: "Email",
    placeholder: "colleague@titanwavemedia.com",
    button: "Add to the team",
    help: "They get an email with a sign in link. They sign in with this email.",
  },

  list: {
    title: "Your team",
    owner: "Owner",
    member: "Team member",
    waiting: "Added, hasn't signed in yet",
    remove: "Remove",
    confirm: "Remove {email} from the team? They won't see Team view any more.",
    empty: "Nobody else is on the team yet. Add someone with the form.",
    cancel: "Cancel",
  },

  done: {
    added: "Added. We emailed {email} a sign in link.",
    removed: "{email} is no longer on the team.",
  },

  errors: {
    email: "Enter an email like name@business.com.",
    already: "That person is already on the team.",
    owner: "That's your own email. You're already the owner.",
    failed: "That didn't go through. Please try again in a moment.",
  },
};

export default teamMembers;
