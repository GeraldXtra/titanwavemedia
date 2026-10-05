// Talking to the site assistant from the browser: the floating chat and the home page chat use
// the same conversation id and the same answers. When the server cannot answer (offline, or the
// AI model is switched off), the short scripted answers in content/assistant.js reply instead.
import { localAnswer } from "./localBrain";

const STORE_ID = "twm-chat-id";
const MAX_SENT = 12;
const MAX_CHARS = 599;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One id for this browser tab, so the conversation is kept together.
export function chatSessionId() {
  const make = () => (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  try {
    let id = sessionStorage.getItem(STORE_ID);
    if (!id) {
      id = make();
      sessionStorage.setItem(STORE_ID, id);
    }
    return id;
  } catch {
    return make();
  }
}

// Sends the conversation and returns the assistant's reply:
// { role: "assistant", text, link, whatsapp, question }.
// `history` is the whole conversation so far, ending with the visitor's new message.
export async function askAssistant(history) {
  const text = history[history.length - 1].text;
  const started = Date.now();
  const minWait = 600 + Math.min(900, text.length * 15);
  let reply;
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: chatSessionId(),
        messages: history.slice(-MAX_SENT).map((m) => ({ role: m.role, content: String(m.text).slice(0, MAX_CHARS) })),
      }),
    });
    const data = await res.json();
    if (!data || typeof data.reply !== "string" || !data.reply) throw new Error("no reply");
    reply = { role: "assistant", text: data.reply, link: data.link || null, whatsapp: !!data.whatsapp, question: text };
  } catch {
    const local = localAnswer(text);
    reply = { role: "assistant", text: local.text, link: local.link, whatsapp: local.whatsapp, question: text };
  }
  const wait = minWait - (Date.now() - started);
  if (wait > 0) await sleep(wait);
  return reply;
}
