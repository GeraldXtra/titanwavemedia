import assistant from "@/content/assistant";
import { fill } from "./text";
import { lagosTime } from "./lagos";

export function hits(text, words) {
  const t = " " + String(text).toLowerCase().replace(/[^a-z0-9₦ ]+/g, " ") + " ";
  let n = 0;
  words.forEach((w) => {
    if (t.indexOf(" " + w + " ") >= 0 || t.indexOf(w) >= 0) n++;
  });
  return n;
}

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
