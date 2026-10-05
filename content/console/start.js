// The first page for someone who has signed in but has no business on the console yet, for
// example after signing in with a new email or with Google.

const start = {
  meta: { title: "Your business, Titan Wave Media Console" },
  title: "Tell us about your business",
  lede: "We need two things to set up your console. You can change them later in Settings.",
  name: "Your name",
  business: "Business name",
  button: "Open my console",
  errors: {
    name: "Enter your name.",
    business: "Enter your business name.",
    failed: "That didn't go through. Please try again in a moment.",
  },
  // Team members without a business of their own: Client view shows this instead.
  team: {
    title: "You don't have a client account",
    text: "Client view shows what your clients see. To try it, add a business for yourself below, or go back to Team view.",
    back: "Go to Team view",
  },
};

export default start;
