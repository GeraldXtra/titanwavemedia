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
  home: "Home",
  loading: "Loading the page",

  fields: {
    email: "Email",
    emailPlaceholder: "you@yourbusiness.com",
    name: "Your name",
    namePlaceholder: "Your full name",
    business: "Business name",
    businessPlaceholder: "Your business",
  },

  signin: {
    title: "Sign in to Titan Wave Media",
    foot: "New here?",
    footLink: "Create an account",
    button: "Send me a sign in link",
    sending: "Sending",
    or: "or",
    google: "Continue with Google",
    help: "No password to remember. We'll email you a link that signs you in.",
    termsBefore: "By signing in, you agree to our ",
    terms: "Terms",
    termsMiddle: " and ",
    privacy: "Privacy Policy",
    termsAfter: ".",
    signedOut: "You're signed out.",
    deleted: "Your account is deleted. Invoices and receipts are kept for the tax records, as our Privacy Policy says.",
    googleFailed: "Google sign in didn't work. Use your email instead.",
  },

  signup: {
    title: "Create your account",
    foot: "Already have one?",
    footLink: "Sign in",
    google: "Sign up with Google",
    termsBefore: "I agree to the ",
    terms: "Terms",
    termsMiddle: " and the ",
    privacy: "Privacy Policy",
    button: "Create my account",
    help: "We'll email you a link to finish. It works once, for 15 minutes.",
    googleTerms: {
      termsBefore: "By signing up with Google, you agree to our ",
      terms: "Terms",
      termsMiddle: " and ",
      privacy: "Privacy Policy",
      termsAfter: ".",
    },
    googleNew: "Signing up with Google isn't open yet. Please message us on WhatsApp, and we'll set up your account.",
  },

  check: {
    title: "Check your email",
    lede: "We sent a sign in link to {email}. It works once, for 15 minutes.",
    ledeNoEmail: "We sent you a sign in link. It works once, for 15 minutes.",
    spam: "Can't find it? Look in your spam folder.",
    resend: "Send it again",
    resendIn: "Send it again in {time}",
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
    backupNote: "Using a backup code turns off two step sign in. We email you, so you can turn it on again.",
    signOut: "Sign out",
  },

  expired: {
    title: "This link has expired",
    lede: "Sign in links work once, for 15 minutes, and only the newest one works. Ask for a new link and use it straight away.",
    button: "Send me a new link",
  },

  errors: {
    email: "Enter your email.",
    emailFormat: "Enter an email like name@yourbusiness.com.",
    name: "Tell us your name.",
    business: "Tell us your business name.",
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

  footer: {
    line: "© {year} Titan Wave Media LTD. RC {rc}. Lagos, Nigeria.",
    label: "Legal and help",
    privacy: "Privacy",
    terms: "Terms",
    help: "Help",
  },

  device: "{browser} on {device}",
  deviceUnknown: "A browser",

  off: {
    title: "Accounts aren't switched on yet",
    text: "The client console isn't open on this site yet. To reach us, message us on WhatsApp or use the contact form.",
    whatsapp: "Chat on WhatsApp",
    contact: "Use the contact form",
  },
};

export default signin;
