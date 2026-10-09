import { logMissing, missingSettings, setting } from "./settings.mjs";

export { missingSettings };

export function accountsReady() {
  const missing = missingSettings();
  logMissing(missing);
  return missing.length === 0;
}

export const googleSignIn = process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === "on";

export function ownerEmail() {
  return setting("OWNER_EMAIL").toLowerCase();
}

export function paystackTestMode() {
  return setting("PAYSTACK_SECRET_KEY").startsWith("sk_test_");
}
