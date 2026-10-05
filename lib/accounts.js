// Whether accounts, the client console and Pay with Titan Wave are switched on, and the settings
// they read. Safe to import anywhere: it only reads settings, never secret values to the browser.

// Every one of these must be set for the console to open. Until then the public site works as
// before and /console shows "Accounts are not switched on yet".
const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "PAYSTACK_SECRET_KEY",
  "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  "OWNER_EMAIL",
  "CRON_SECRET",
];

export function missingSettings() {
  return REQUIRED.filter((name) => !String(process.env[name] || "").trim());
}

export function accountsReady() {
  return missingSettings().length === 0;
}

// "Continue with Google" shows only when NEXT_PUBLIC_GOOGLE_SIGNIN is "on".
export const googleSignIn = process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === "on";

// The owner of Titan Wave Media, who sees both Client view and Team view.
export function ownerEmail() {
  return String(process.env.OWNER_EMAIL || "").trim().toLowerCase();
}

// Paystack test keys start with sk_test_. While they do, payments say "Test mode".
export function paystackTestMode() {
  return String(process.env.PAYSTACK_SECRET_KEY || "").startsWith("sk_test_");
}
