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
  const sendsEmail = process.env.NODE_ENV === "production" && process.env.EMAIL_LOG_ONLY !== "1";
  const names = sendsEmail ? [...REQUIRED, "RESEND_API_KEY"] : REQUIRED;
  return names.filter((name) => !usable(name, String(process.env[name] || "").trim()));
}

function usable(name, value) {
  if (!value) return false;
  if (name !== "NEXT_PUBLIC_SUPABASE_URL") return true;
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

let lastLogged = 0;

export function accountsReady() {
  const missing = missingSettings();
  if (missing.length && typeof window === "undefined" && Date.now() - lastLogged > 60 * 1000) {
    lastLogged = Date.now();
    console.error(`[accounts] Accounts aren't switched on. Missing or invalid settings: ${missing.join(", ")}`);
  }
  return missing.length === 0;
}

export const googleSignIn = process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === "on";

export function ownerEmail() {
  return String(process.env.OWNER_EMAIL || "").trim().toLowerCase();
}

export function paystackTestMode() {
  return String(process.env.PAYSTACK_SECRET_KEY || "").startsWith("sk_test_");
}
