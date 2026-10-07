import project from "./project";

const ledgerwatch = project.pages.ledgerwatch;

const post = {
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
    "meet-wave-assist": {
      published: true,
      meta: {
        title: "Meet Wave Assist, Titan Wave Media",
        description: "A chat assistant for your own website. It answers your customers from what you teach it, and hands them to you when it isn't sure.",
      },
      title: "Meet Wave Assist",
      date: "6 October 2026",
      datetime: "2026-10-06",
      author: "Gerald",
      opening: "Wave Assist is ready. It's a chat assistant you add to your own website, and it answers your customers in English, day and night.",
      body: [
        { heading: "It answers from what you teach it" },
        {
          paragraph:
            "You set it up in your console. Tell it what you sell, your prices or menu, your opening hours and where you deliver. Add the questions your customers ask most, with your answers, and paste in anything else it should know. It answers only from that. It never makes up a price, a time or a promise.",
        },
        { heading: "A person is always there" },
        {
          paragraph:
            "When it isn't sure, or a customer asks for a person, it hands them to you. It shows them every way to reach you that you gave it: your WhatsApp with their question already typed, your phone and your email. Or they can leave their name and a phone number or email, so you can get back to them.",
        },
        { heading: "You see every conversation" },
        {
          paragraph:
            "Every conversation shows in your console, with the questions it couldn't answer. Add an answer to one, and it uses that answer from then on. You can test it there too, before your customers ever see it.",
        },
        { heading: "Putting it on your website" },
        {
          paragraph:
            "It goes on your website with one line of code. Copy it from your console, or send the steps to the person who looks after your website. Wave Assist is available now. Press Talk to us and tell us a little about your business.",
        },
        { links: [{ label: "Talk to us", href: "/contact?need=tool&product=wave-assist" }] },
      ],
    },
    "ledgerwatch-is-live": {
      published: true,
      meta: {
        title: "LedgerWatch is live, Titan Wave Media",
        description: "Our app for businesses that sell on credit is live and free. It keeps track of who owes you, sends the reminders, and watches coin prices.",
      },
      title: "LedgerWatch is live",
      date: "6 August 2026",
      datetime: "2026-08-06",
      author: "Gerald",
      opening: "LedgerWatch is live, and it's free to use. It's our own app for businesses that sell on credit.",
      body: [
        { image: ledgerwatch.cover },
        { heading: "Why I built it" },
        {
          paragraph:
            "If you sell on credit, you know how it goes. You finish the work and send the invoice. Then someone has to remember to follow it up. Often nobody does, and money you already earned just sits there. The customer didn't refuse to pay. Nobody chased it.",
        },
        { heading: "What it does" },
        {
          paragraph:
            "LedgerWatch keeps track of who owes you and when it was due. It writes the reminders and sends them over WhatsApp or email, with your bank details already in them. It takes part payments as they come in, and stops chasing the moment an invoice is paid.",
        },
        { image: ledgerwatch.shots[0] },
        {
          paragraph:
            "A customer can also pay in a dollar stablecoin, to an address made for that one invoice. When the payment confirms, the invoice closes by itself.",
        },
        {
          paragraph:
            "Market Watch watches coin prices against conditions you set. When one is met, it tells you what happened and waits for you to decide. It starts in paper mode, with a simulated portfolio that follows real prices, so you can try it without risking anything.",
        },
        { image: ledgerwatch.shots[1] },
        { heading: "You stay in charge" },
        {
          paragraph:
            "The app prepares, and you approve. Reminders wait for you unless you choose to let them send themselves. Create a free account and add the first person who owes you.",
        },
        { links: [{ label: "Open LedgerWatch", href: "https://useledgerwatch.co" }] },
      ],
    },
  },
};

export default post;
