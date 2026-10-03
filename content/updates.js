// The Updates page. The first three posts also show on the home page.
// Each post links to its own page; the words for those pages are in content/post.js.

const updates = {
  meta: {
    title: "Updates, Titan Wave Media",
    description: "Product launches, what we are building, and what we learn along the way.",
  },

  hero: {
    title: "Read what we are building and launching.",
    text: "Product launches, what we are building, and what we learn along the way.",
  },

  // A heading for screen readers over the list below (it is not shown on the page).
  listTitle: "All updates",

  filters: {
    label: "Filter updates",
    // "value" must match the "cat" of the posts below.
    options: [
      { value: "all", label: "All" },
      { value: "product", label: "Product" },
      { value: "news", label: "News" },
      { value: "learned", label: "What we learned" },
    ],
  },

  items: [
    { slug: "example", cat: "product", tag: "Product", date: "[Date]", title: "[Post title]", summary: "[Two line summary of the post]" },
    { slug: "example", cat: "news", tag: "News", date: "[Date]", title: "[Post title]", summary: "[Two line summary of the post]" },
    { slug: "example", cat: "learned", tag: "What we learned", date: "[Date]", title: "[Post title]", summary: "[Two line summary of the post]" },
  ],

  notify: {
    title: "Get our updates by email.",
    text: "We only send an email when there is something new.",
    thanks: "Thanks. You will hear from us when there is news.",
  },
};

export default updates;
