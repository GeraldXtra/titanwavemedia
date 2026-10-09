export const ACCOUNT_SETTINGS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "PAYSTACK_SECRET_KEY",
  "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  "OWNER_EMAIL",
  "CRON_SECRET",
];

const QUOTES = ['"', "'", "`"];

export function clean(value) {
  let text = String(value == null ? "" : value).trim();
  while (text.length >= 2 && QUOTES.includes(text[0]) && text[text.length - 1] === text[0]) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

export function setting(name) {
  return clean(process.env[name]);
}

export function cleanUrl(value) {
  let text = clean(value).replace(/\/+$/, "");
  if (!text) return "";
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text) && /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?$/i.test(text)) text = `https://${text}`;
  if (!/^https?:\/\//i.test(text)) return "";
  try {
    new URL(text);
    return text;
  } catch {
    return "";
  }
}

export function settingUrl(name) {
  return cleanUrl(process.env[name]);
}

export function supabaseUrl() {
  return settingUrl("SUPABASE_URL") || settingUrl("NEXT_PUBLIC_SUPABASE_URL");
}

function sendsEmail() {
  return process.env.NODE_ENV === "production" && setting("EMAIL_LOG_ONLY") !== "1";
}

export function missingSettings() {
  const names = sendsEmail() ? [...ACCOUNT_SETTINGS, "RESEND_API_KEY"] : ACCOUNT_SETTINGS;
  return names.filter((name) => (name === "NEXT_PUBLIC_SUPABASE_URL" ? !settingUrl(name) : !setting(name)));
}

const LOGGED = Symbol.for("titanwave.accounts.logged");

export function logMissing(missing) {
  if (!missing.length || typeof window !== "undefined") return;
  const last = Math.max(globalThis[LOGGED] || 0, Number(process.env.TITANWAVE_ACCOUNTS_LOGGED) || 0);
  if (Date.now() - last < 60 * 1000) return;
  globalThis[LOGGED] = Date.now();
  process.env.TITANWAVE_ACCOUNTS_LOGGED = String(globalThis[LOGGED]);
  console.error(`[accounts] Accounts aren't switched on. Missing or invalid settings: ${missing.join(", ")}`);
}
