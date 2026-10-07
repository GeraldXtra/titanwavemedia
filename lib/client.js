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
