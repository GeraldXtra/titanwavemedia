const isDev = process.env.NODE_ENV === "development";

// The Supabase project the console talks to: file uploads go straight from the browser to its
// storage. Any Supabase project until NEXT_PUBLIC_SUPABASE_URL is set.
function supabaseOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
  } catch {
    return "https://*.supabase.co";
  }
}

// Pay with Titan Wave: Paystack's script, the API it calls, and its secure payment window.
const paystack = {
  script: "https://js.paystack.co",
  api: "https://api.paystack.co",
  checkout: "https://checkout.paystack.com",
};

// Pages stay static, so the policy allows inline scripts instead of using nonces.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${paystack.script}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin()} ${paystack.api}`,
  `frame-src ${paystack.checkout}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Only on Vercel: a local `next start` runs over plain http.
  process.env.VERCEL ? "upgrade-insecure-requests" : "",
]
  .filter(Boolean)
  .join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  agentRules: false,
  // The assistant reads its rules from this file while the site runs.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/assistant-rules.md"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
