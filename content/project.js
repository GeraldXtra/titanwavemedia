// The project page template. Each entry in `pages` is a page at /work/<key>.
// To add a project, copy the "example" entry, give it a new key and change the words.
// Set `published` to true once a page has real words, so search engines are told about it.

const project = {
  // Shared by every project page.
  labels: {
    crumb: "Work",
    next: "Next project",
    share: "Share this project",
    copy: "Copy link",
    copied: "Link copied",
    copyPrompt: "Copy this link",
  },

  cta: {
    title: "Want to be next?",
    buttons: [{ label: "Start a project", href: "/contact?need=ai-setup", style: "dark" }],
  },

  pages: {
    example: {
      published: false,
      meta: {
        title: "[Project name], Titan Wave Media",
        description: "[One line on what we built and for whom]",
      },
      name: "[Project name]",
      line: "[One line on what we built and for whom]",
      facts: [
        { label: "Client", value: "[Client name]" },
        { label: "Service", value: "[AI setup, Product or Data]" },
        { label: "Industry", value: "[Industry]" },
        { label: "Year", value: "[Year]" },
      ],
      screenshot: "[Project screenshot]",
      stories: [
        { title: "The problem", text: "[What the client needed, and why it mattered]" },
        { title: "What we built", text: "[What we built and how it works, in plain words]" },
        { title: "How we handled the data", text: "[How personal details were kept safe]" },
        { title: "What changed", text: "[The result, in the client's words or with real numbers]" },
      ],
      secondScreenshot: "[Second screenshot]",
      next: { name: "[Next project name]", href: "/work/example" },
    },
  },
};

export default project;
