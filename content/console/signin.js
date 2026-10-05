// The sign in pages: Sign in, Create your account, Check your email, Signing you in, Enter your
// code, This link has expired, and the page shown while accounts are not switched on.
// {email} is the address the link went to. {year} and {rc} are filled in.

const signin = {
  meta: {
    signin: { title: "Sign in, Titan Wave Media", description: "Sign in to your Titan Wave Media console to follow your projects and pay invoices." },
    signup: { title: "Create your account, Titan Wave Media", description: "Create a free Titan Wave Media account for your business." },
    check: { title: "Check your email, Titan Wave Media" },
    verify: { title: "Signing you in, Titan Wave Media" },
    code: { title: "Enter your code, Titan Wave Media" },
    expired: { title: "This link has expired, Titan Wave Media" },
    off: { title: "Accounts aren't switched on yet, Titan Wave Media" },
  },

  brand: "Titan Wave Media",
  homeLabel: "Titan Wave Media, home",

  fields: {
    email: "Email",
    emailPlaceholder: "you@business.com",
    name: "Your name",
    business: "Business name",
  },

  signin: {
    title: "Sign in",
    lede: "No password to remember. Type your email and we'll send you a link that signs you in.",
    button: "Send me a sign in link",
    sending: "Sending",
    or: "or",
    google: "Continue with Google",
    foot: "New here?",
    footLink: "Create an account",
    signedOut: "You're signed out.",
    deleted: "Your account is deleted. Invoices and receipts are kept for the tax records, as our Privacy Policy says.",
    googleFailed: "Google sign in didn't work. Use your email instead.",
  },

  signup: {
    title: "Create your account",
    lede: "One place for your projects, your invoices and our products as they open. It's free, and no card is needed.",
    // The tick box: [Terms] and [Privacy Policy] are links.
    termsBefore: "I agree to the ",
    terms: "Terms",
    termsMiddle: " and the ",
    privacy: "Privacy Policy",
    button: "Create my account",
    foot: "Already have an account?",
    footLink: "Sign in",
  },

  check: {
    title: "Check your email",
    lede: "We sent a sign in link to {email}. It works once, for the next 15 minutes.",
    // When the page is opened without having just asked for a link.
    ledeNoEmail: "We sent you a sign in link. It works once, for the next 15 minutes.",
    spam: "Not there? Look in Spam or Promotions.",
    resend: "Send it again",
    resendIn: "in {time}",
    resent: "We sent a new link. Only the newest one works.",
    other: "Use a different email",
  },

  verify: {
    title: "Signing you in",
    link: "Checking your link.",
    google: "Checking with Google.",
    code: "Checking your code.",
    noScript: "Press Continue to sign in.",
    button: "Continue",
  },

  code: {
    title: "Enter your code",
    lede: "Two step sign in is on. Open your authenticator app and type the 6 digit code for Titan Wave Media.",
    group: "6 digit code",
    digit: "Digit {n} of 6",
    backupLabel: "Backup code",
    backupPlaceholder: "xxxx xxxx",
    button: "Continue",
    useBackup: "Use a backup code instead",
    useApp: "Use the code from my app",
    // What happens when a backup code is used, shown under the backup code box.
    backupNote: "Using a backup code turns off two step sign in. We email you, so you can turn it on again.",
    signOut: "Sign out",
  },

  expired: {
    title: "This link has expired",
    lede: "Sign in links work once, for 15 minutes, and only the newest one works. Ask for a new link and use it straight away.",
    button: "Send me a new link",
  },

  // Form messages.
  errors: {
    email: "Enter your email.",
    emailFormat: "Enter an email like name@business.com.",
    name: "Enter your name.",
    business: "Enter your business name.",
    terms: "Tick the box to agree to the Terms and the Privacy Policy.",
    wait: "Wait {seconds} seconds before you ask for another link.",
    tooManyEmail: "Too many sign in links for this email. Try again in an hour.",
    tooManyNetwork: "Too many sign in links from this network. Try again in an hour.",
    failed: "That didn't go through. Please try again in a moment.",
    codeLength: "Type all 6 digits.",
    backupLength: "Backup codes have 8 characters.",
    codeWrong: "That code didn't work. Try again.",
    backupWrong: "That backup code didn't work. Check it and try again.",
    codeTooMany: "Too many tries. Wait 15 minutes, then try again.",
  },

  // The bottom of the sign in pages.
  footer: {
    line: "© {year} Titan Wave Media LTD. RC {rc}. Lagos, Nigeria.",
    label: "Policies and help",
    privacy: "Privacy",
    terms: "Terms",
    help: "Help",
  },

  // "Chrome on Windows", for the sign in email and the sign in history.
  device: "{browser} on {device}",
  deviceUnknown: "A browser",

  // /console while the settings in .env.example are not all filled in.
  off: {
    title: "Accounts aren't switched on yet",
    text: "The client console isn't open on this site yet. To reach us, message us on WhatsApp or use the contact form.",
    whatsapp: "Chat on WhatsApp",
    contact: "Use the contact form",
  },
};

export default signin;
