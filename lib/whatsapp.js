import { format } from "./text";

export function waLink(base, text) {
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function joinNatural(list, and = " and ") {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")}${and}${list[list.length - 1]}`;
}

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

export function builderPhrase(build, { what = [], where = "", size = "" }) {
  const s = build.summary;
  const whatPhrases = build.what.options.filter((o) => what.includes(o.value)).map((o) => o.phrase);
  const wherePhrase = (build.where.options.find((o) => o.value === where) || {}).phrase || "";
  const sizePhrase = (build.size.options.find((o) => o.value === size) || {}).phrase || "";
  if (!whatPhrases.length && !wherePhrase && !sizePhrase) return "";
  const head = whatPhrases.length ? joinNatural(whatPhrases, s.and) : s.setupWord;
  return [head, wherePhrase, sizePhrase].filter(Boolean).join(" ");
}

export function builderMessage(build, picks) {
  const phrase = builderPhrase(build, picks);
  return phrase ? format(build.summary.message, { picks: phrase }) : build.summary.messageNothing;
}
