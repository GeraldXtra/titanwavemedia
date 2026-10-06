// The Work page. The projects themselves, and the words for their own pages, are in
// content/project.js; every published one gets a tile here, in the same order, and the first
// three also show on the home page.

import project from "./project";

const work = {
  meta: {
    title: "Our work, Titan Wave Media",
    description: "Projects we've built, with the problem each one fixes, who it's for and the tools we used.",
  },

  hero: {
    title: "See what we've built.",
    text: "Projects we've built, with the problem each one fixes, who it's for and the tools we used.",
  },

  // A heading for screen readers over the list below (it is not shown on the page).
  listTitle: "All projects",

  // The buttons are "All", then one for each kind of project in content/project.js that has at
  // least one published project.
  filters: {
    label: "Filter projects",
    all: "All",
    searchLabel: "Search projects",
    searchPlaceholder: "Search projects",
    empty: "Nothing matches yet. Try another word.",
  },

  // The words that show when a tile is turned over.
  flip: {
    problem: "The problem",
    built: "What we built",
  },

  items: Object.entries(project.pages)
    .filter(([, p]) => p.published)
    .map(([slug, p]) => ({
      slug,
      kind: p.kind,
      tag: project.kinds[p.kind],
      name: p.name,
      card: p.card,
      needed: p.needed,
      built: p.built,
      cover: p.cover,
    })),

  cta: {
    title: "Tell us what you want built.",
    buttons: [{ label: "Start a project", href: "/contact?need=ai-setup", style: "line" }],
  },
};

export default work;
