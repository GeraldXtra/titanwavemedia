// Small helpers for the console's forms in the browser.

// Posts JSON to one of our own routes. Returns { status, data } and never throws: a network
// failure comes back as status 0 with an empty object.
export async function postJson(url, body, { method = "POST" } = {}) {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
      credentials: "same-origin",
    });
    let data = {};
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, data };
  } catch {
    return { status: 0, data: {} };
  }
}

// What the sign in pages remember between pages in this tab: the email a link went to, and
// when, for "Check your email" and "Send it again". Kept in this tab only.
const KEY = "twm-signin";

export function rememberLink(email, seconds = 60) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ email, next: Date.now() + seconds * 1000 }));
  } catch {}
}

export function recallLink() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "null") || {};
  } catch {
    return {};
  }
}
