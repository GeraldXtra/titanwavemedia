// The console home page for clients.

const home = {
  meta: { title: "Home, Titan Wave Media Console" },

  // The greeting follows the time in Lagos.
  morning: "Good morning, {name}",
  afternoon: "Good afternoon, {name}",
  evening: "Good evening, {name}",
  // When we do not know their first name yet.
  greetNoName: "Welcome",
  lede: "{business}. Here's what's happening with your projects and invoices.",
  start: "Start a project",

  due: {
    one: "You have 1 invoice to pay, {total} in total. {number} is due on {date}.",
    many: "You have {count} invoices to pay, {total} in total. {number} is due first, on {date}.",
    late: "You have {count} invoices to pay, {total} in total. {number} was due on {date}.",
    see: "See the invoice",
    pay: "Pay now",
  },

  project: {
    title: "Your project",
    stepOf: "Step {n} of 5",
    open: "Open the project",
    more: "See all {count} projects",
    emptyTitle: "No projects yet",
    emptyText: "Tell us what you need. We read every request ourselves, reply within working hours, and set up a first call.",
    emptyButton: "Start a project",
  },

  todo: {
    title: "Getting started",
    count: "{done} of {total}",
    items: {
      details: { label: "Add your business details", href: "/console/settings" },
      twostep: { label: "Turn on two step sign in", href: "/console/settings?tab=security" },
      team: { label: "Invite your team", href: "/console/settings?tab=team" },
      card: { label: "Save a card for monthly payments", href: "/console/billing?tab=methods" },
    },
    done: "Done",
  },

  activity: {
    title: "Recent activity",
    empty: "Nothing yet. Your projects, invoices and payments show here as they happen.",
  },
};

export default home;
