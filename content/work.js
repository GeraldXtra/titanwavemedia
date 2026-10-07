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

  listTitle: "All projects",

  filters: {
    label: "Filter projects",
    all: "All",
    searchLabel: "Search projects",
    searchPlaceholder: "Search projects",
    empty: "Nothing matches yet. Try another word.",
  },

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
