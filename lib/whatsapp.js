// The words a WhatsApp link fills in for the visitor. The rule everywhere: only what the person
// picked or typed, written as one natural message. With nothing picked or typed it is only the
// greeting and a space, so they write their own words. The words live in the content files.

import { format } from "./text";

// A wa.me link with the message filled in.
export function waLink(base, text) {
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// "a, b and c"
export function joinNatural(list, and = " and ") {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")}${and}${list[list.length - 1]}`;
}

// The Contact page. `v` holds what is on the form: name, need, channel, rows, product (a product's
// slug, or "not-sure"), message.
// The extra choices (channel, rows, product) start empty and count only once picked.
// `fromBuilder`: the message box holds the setup builder's words, which already say what they
// want, so no second sentence about it is added.
export function contactMessage(copy, v, { fromBuilder = false } = {}) {
  const w = copy.whatsapp;
  const extra = copy.form.extra;
  const pick = (need, value) => (extra[need] ? extra[need].options.find((o) => o.value === value) : null);
  const parts = [];
  const name = String(v.name || "").trim();
  if (name) parts.push(format(w.name, { name }));

  let sentence = "";
  if (!fromBuilder) {
    if (v.need === "ai-setup") {
      const o = pick("ai-setup", v.channel);
      sentence = o && o.sentence ? o.sentence : w.need["ai-setup"];
    } else if (v.need === "data") {
      const o = pick("data", v.rows);
      sentence = o && o.phrase ? format(w.need.dataRows, { rows: o.phrase }) : w.need.data;
    } else if (v.need === "tool") {
      // A product picked: its name. "Not sure yet" has no phrase, so it reads like nothing picked.
      const o = pick("tool", v.product);
      sentence = o && o.phrase ? format(w.need.toolProduct, { product: o.phrase }) : w.need.tool;
    } else if (v.need && w.need[v.need] !== undefined) {
      sentence = w.need[v.need];
    }
  }
  if (sentence) parts.push(sentence);

  const message = String(v.message || "").trim();
  if (message) parts.push(message);
  return w.greeting + parts.join(" ");
}

// The setup builder's picks as one phrase: "a chat assistant that answers customers and a
// dashboard on WhatsApp for a team of 2 to 10 people". Empty when nothing is picked.
export function builderPhrase(build, { what = [], where = "", size = "" }) {
  const s = build.summary;
  const whatPhrases = build.what.options.filter((o) => what.includes(o.value)).map((o) => o.phrase);
  const wherePhrase = (build.where.options.find((o) => o.value === where) || {}).phrase || "";
  const sizePhrase = (build.size.options.find((o) => o.value === size) || {}).phrase || "";
  if (!whatPhrases.length && !wherePhrase && !sizePhrase) return "";
  const head = whatPhrases.length ? joinNatural(whatPhrases, s.and) : s.setupWord;
  return [head, wherePhrase, sizePhrase].filter(Boolean).join(" ");
}

// What Ask for a quote puts in the Contact page's message box.
export function builderMessage(build, picks) {
  const phrase = builderPhrase(build, picks);
  return phrase ? format(build.summary.message, { picks: phrase }) : build.summary.messageNothing;
}
