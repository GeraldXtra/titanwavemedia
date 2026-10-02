// The update post template. Each entry in `pages` is a page at /updates/<key>.
// To add a post, copy the "example" entry, give it a new key and change the words.
// Set `published` to true once a page has real words, so search engines are told about it.

const post = {
  // Shared by every post.
  labels: {
    crumb: "Updates",
    byline: "{date}, by {author}",
    back: { label: "Back to updates", href: "/updates" },
    readTime: "{minutes} minute read",
    copy: "Copy link",
    copied: "Link copied",
    copyPrompt: "Copy this link",
    more: "More updates",
  },

  pages: {
    example: {
      published: false,
      meta: {
        title: "[Post title], Titan Wave Media",
        description: "[Two line summary of the post]",
      },
      title: "[Post title]",
      date: "[Date]",
      author: "[Author]",
      opening: "[Opening paragraph that says what this post is about]",
      // The rest of the post, in order: { image }, { heading } and { paragraph } blocks.
      body: [
        { image: "[Image]" },
        { heading: "[Section heading]" },
        { paragraph: "[Paragraph]" },
        { paragraph: "[Paragraph]" },
        { heading: "[Section heading]" },
        { paragraph: "[Paragraph]" },
      ],
    },
  },
};

export default post;
