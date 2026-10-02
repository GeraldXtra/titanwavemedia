// The local brain: matches a question against the scripted answers in content/assistant.js.
// The site assistant uses it when the AI model is switched off or does not reply, and the
// home page restaurant demo uses the same matching with its own script.
import assistant from "@/content/assistant";
import { fill } from "./text";
import { lagosTime } from "./lagos";

// How many of the words appear in the text.
export function hits(text, words) {
  const t = " " + String(text).toLowerCase().replace(/[^a-z0-9₦ ]+/g, " ") + " ";
  let n = 0;
  words.forEach((w) => {
    if (t.indexOf(" " + w + " ") >= 0 || t.indexOf(w) >= 0) n++;
  });
  return n;
}

// The entry whose words match best. On a tie the first one wins.
export function bestMatch(text, entries) {
  let best = null;
  let score = 0;
  entries.forEach((entry) => {
    const n = hits(text, entry.words);
    if (n > score) {
      score = n;
      best = entry;
    }
  });
  return best;
}

// Returns { text, link, whatsapp } for a visitor's question.
export function localAnswer(question) {
  const best = bestMatch(question, assistant.brain);
  if (!best) return { text: assistant.notOnSite, link: null, whatsapp: true };
  const raw = Array.isArray(best.answer) ? best.answer[Math.floor(Math.random() * best.answer.length)] : best.answer;
  return {
    text: fill(raw).replace(/\{time\}/g, lagosTime()),
    link: best.link || null,
    whatsapp: !!best.whatsapp,
  };
}
