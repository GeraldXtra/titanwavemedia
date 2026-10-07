import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { after } from "next/server";
import words from "@/content/assist";
import { getAdmin } from "../supabase";
import { lagosClock } from "../format";
import { format } from "../text";
import { costUsd, priceFor } from "./prices";
import { isLocal } from "./sites";

export const MODEL = process.env.ASSIST_MODEL || "claude-haiku-4-5-20251001";
export const DEADLINE_MS = 20_000;
const MAX_TOKENS = 400;
const HISTORY = 12;
const MAX_TEXT = 1000;

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1 });
  return client;
}

export function usesModel() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function businessName(assistant) {
  return String((assistant && assistant.name) || "").trim() || words.noName;
}

export function setReply(kind, assistant) {
  return format(words.replies[kind], { business: businessName(assistant) });
}

const unwrap = (text) => String(text ?? "").replace(/<\/?business\b[^>]*>/gi, "").trim();

function detailsBlock(a) {
  const d = words.details;
  const line = (label, value) => `${label}: ${unwrap(value) || d.none}`;
  const block = (label, value) => `${label}:\n${unwrap(value) || d.none}`;
  const reach = [
    a.whatsapp ? `${d.whatsapp} +${a.whatsapp}` : "",
    a.phone ? `${d.phone} ${unwrap(a.phone)}` : "",
    a.email ? `${d.email} ${unwrap(a.email)}` : "",
  ].filter(Boolean);
  const sites = (Array.isArray(a.sites) ? a.sites : []).filter((s) => !isLocal(s)).map((s) => `https://${s}`);
  const docs = (Array.isArray(a.docs) ? a.docs : [])
    .filter((x) => x && typeof x.text === "string" && x.text.trim())
    .map((x) => `${d.doc}: ${unwrap(x.name) || d.none}\n${unwrap(x.text)}`);
  const qa = (Array.isArray(a.qa) ? a.qa : [])
    .filter((p) => p && typeof p.q === "string" && typeof p.a === "string" && p.q.trim() && p.a.trim())
    .map((p) => `${d.q}: ${unwrap(p.q)}\n${d.a}: ${unwrap(p.a)}`);
  return [
    d.intro,
    "<business>",
    line(d.name, a.name),
    block(d.sells, a.sells),
    block(d.prices, a.prices),
    line(d.hours, a.hours),
    line(d.areas, a.areas),
    line(d.reach, reach.join(", ")),
    line(d.sites, sites.join(", ")),
    `${d.qa}:\n${qa.length ? qa.join("\n\n") : d.none}`,
    block(d.extra, a.extra),
    `${d.docs}:\n${docs.length ? docs.join("\n\n") : d.none}`,
    "</business>",
  ].join("\n\n");
}

const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", weekday: "long", day: "numeric", month: "long", year: "numeric" });

export function systemBlocks(assistant, now = new Date()) {
  return [
    { type: "text", text: words.rules.join("\n\n") },
    { type: "text", text: detailsBlock(assistant), cache_control: { type: "ephemeral" } },
    { type: "text", text: format(words.now, { day: dayFmt.format(now).replace(",", ""), time: lagosClock(now) }) },
  ];
}

export const REPLY_TOOL = {
  name: "reply",
  description: words.tool.description,
  input_schema: {
    type: "object",
    properties: {
      text: { type: "string", description: words.tool.text },
      answered: { type: "boolean", description: words.tool.answered },
      handover: { type: "boolean", description: words.tool.handover },
      person: { type: "boolean", description: words.tool.person },
    },
    required: ["text", "answered", "handover", "person"],
  },
};

function messagesFor(history, question) {
  const out = [];
  const list = [...(Array.isArray(history) ? history.slice(-HISTORY) : []), { role: "customer", text: question }];
  for (const m of list) {
    const role = m.role === "customer" ? "user" : "assistant";
    const content = String(m.text || "").trim().slice(0, 2000);
    if (!content || (!out.length && role !== "user")) continue;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content;
    else out.push({ role, content });
  }
  return out;
}

export function tidy(text) {
  let t = String(text ?? "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`+/g, "")
    .replace(/^\s*#+\s*/gm, "")
    .replace(/^\s*(?:[-*\u2022]|\d+[.)])\s+/gm, "")
    .replace(/(\d)\s*[\u2012\u2013\u2014\u2015]\s*(\d)/g, "$1 to $2")
    .replace(/(\d) +- +(\d)/g, "$1 to $2")
    .replace(/\s+[\u2012\u2013\u2014\u2015-]+\s+/g, ", ")
    .replace(/[\u2012\u2013\u2014\u2015]/g, ", ")
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D]/gu, "")
    .replace(/!+(?=\s|$)/g, ".")
    .replace(/[ \t]+/g, " ")
    .replace(/ +([,.])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (t.length > MAX_TEXT) {
    const cut = t.slice(0, MAX_TEXT);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("\n"));
    t = (end > MAX_TEXT / 2 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "")).trim();
  }
  return t;
}

const COMMON = new Set(
  ("the and you your yours are is was were be been being do does did can could will would should shall may might must " +
    "what when where which who whom whose how why have has had for with about this that these those there here from into " +
    "onto any some get got much many also just want wants need needs know tell give show please thanks thank okay " +
    "me my mine our ours we us it its of to in on at by or if am an as not no yes so too very they them their " +
    "she he him her his hers than then out up down off over under again more most such only own same other all both each " +
    "few now one two let like make made way well still even really ever every hey hello hi").split(" ")
);

function stem(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("ery")) return w.slice(0, -1);
  return w;
}

const plainWords = (text) => String(text ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function keyWords(text) {
  const out = new Set();
  for (const w of plainWords(text).split(" ")) {
    if (w.length < 3 || COMMON.has(w)) continue;
    out.add(stem(w));
  }
  return out;
}

const hasPhrase = (text, phrase) => ` ${text} `.includes(` ${phrase} `);

export function matchAnswer(assistant, question) {
  const name = businessName(assistant);
  const q = plainWords(question);
  const list = [...words.match.greetings].sort((x, y) => y.length - x.length).map((g) => g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const greeting = new RegExp(`(^| )(${list.join("|")})(?= |$)`, "g");
  const rest = q.replace(greeting, " ").trim();
  const restWords = rest.split(" ").filter((w) => w.length > 2 && !COMMON.has(w) && !["there", "team"].includes(w));
  if (q && rest !== q && !restWords.length) {
    return { text: assistant.greeting ? tidy(assistant.greeting) : format(words.greeting, { business: name }), answered: true, handover: false };
  }
  if (words.match.person.some((p) => hasPhrase(q, p))) {
    return { text: setReply("person", assistant), answered: false, handover: true, person: true };
  }
  const asked = keyWords(question);
  let best = null;
  for (const pair of Array.isArray(assistant.qa) ? assistant.qa : []) {
    if (!pair || typeof pair.q !== "string" || typeof pair.a !== "string" || !pair.a.trim()) continue;
    const known = keyWords(pair.q);
    if (!known.size || !asked.size) continue;
    let shared = 0;
    for (const w of asked) if (known.has(w)) shared++;
    const score = shared / (asked.size + known.size - shared);
    const real = (shared >= 2 && score >= 0.25) || (shared >= 1 && score >= 0.5);
    if (real && (!best || score > best.score)) best = { score, answer: pair.a };
  }
  if (best) return { text: String(best.answer).trim().slice(0, MAX_TEXT), answered: true, handover: false };
  return { text: setReply("notSure", assistant), answered: false, handover: true };
}

class Deadline extends Error {}

function logError(error) {
  if (error instanceof Anthropic.AuthenticationError) console.error("[assist] The Anthropic key was refused. Check ANTHROPIC_API_KEY.");
  else if (error instanceof Anthropic.RateLimitError) console.error("[assist] Anthropic rate limit reached.");
  else if (error instanceof Anthropic.APIConnectionError) console.error("[assist] Could not reach Anthropic:", error.message);
  else if (error instanceof Anthropic.APIError) console.error(`[assist] Anthropic error ${error.status}:`, error.message);
  else console.error("[assist]", error && error.message);
}

async function insertUsage(row) {
  const admin = getAdmin();
  if (!admin) return;
  const { error } = await admin.from("assist_usage").insert(row);
  if (error) console.error("[assist] usage:", error.message);
}

async function keepUsage(row) {
  try {
    after(() => insertUsage(row));
  } catch {
    await insertUsage(row);
  }
}

export async function answer({ assistant, history = [], question, test = false, conversationId = null }) {
  const api = getClient();
  if (!api) return { ...matchAnswer(assistant, question), source: "match", usage: null };

  const started = Date.now();
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Deadline("the answer took more than 20 seconds"));
    }, DEADLINE_MS);
  });

  let res = null;
  let outcome = "ok";
  let reply = null;
  try {
    const call = api.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.2,
        system: systemBlocks(assistant),
        tools: [REPLY_TOOL],
        tool_choice: { type: "tool", name: REPLY_TOOL.name },
        messages: messagesFor(history, question),
      },
      { signal: controller.signal, maxRetries: 1, timeout: DEADLINE_MS }
    );
    call.catch(() => {});
    res = await Promise.race([call, deadline]);
    if (res.stop_reason === "refusal") throw new Error("the model declined to answer");
    if (res.stop_reason === "max_tokens") throw new Error("the answer ran past the token limit");
    const use = res.content.find((b) => b.type === "tool_use" && b.name === REPLY_TOOL.name);
    const input = use && use.input;
    const text = input && typeof input.text === "string" ? tidy(input.text) : "";
    if (!text) throw new Error("the model sent no answer");
    const person = input.person === true;
    const answered = !person && input.answered === true;
    reply = { text, answered, handover: person || !answered || input.handover === true, person, source: "model" };
  } catch (error) {
    const late = error instanceof Deadline || error instanceof Anthropic.APIUserAbortError || error instanceof Anthropic.APIConnectionTimeoutError;
    outcome = late ? "timeout" : "error";
    if (late) console.error("[assist] The answer took more than 20 seconds. Offered a person instead.");
    else logError(error);
    reply = { text: setReply(late ? "slow" : "failed", assistant), answered: null, handover: true, source: late ? "timeout" : "error" };
  } finally {
    clearTimeout(timer);
  }

  const ms = Date.now() - started;
  const u = (res && res.usage) || {};
  const usage = {
    input: u.input_tokens || 0,
    output: u.output_tokens || 0,
    cacheWrite: u.cache_creation_input_tokens || 0,
    cacheRead: u.cache_read_input_tokens || 0,
    cost: costUsd(MODEL, u),
    ms,
    outcome,
  };
  console.log(
    `[assist] ${MODEL}${test ? " test" : ""}: tokens in ${usage.input}, out ${usage.output}, cache write ${usage.cacheWrite}, cache read ${usage.cacheRead}, ${ms} ms, ${outcome}, ${priceFor(MODEL) ? `about $${usage.cost.toFixed(5)}` : "price unknown"}`
  );
  await keepUsage({
    assistant_id: assistant.id,
    business_id: assistant.business_id,
    conversation_id: conversationId || null,
    test: Boolean(test),
    model: MODEL.slice(0, 100),
    input_tokens: usage.input,
    output_tokens: usage.output,
    cache_write_tokens: usage.cacheWrite,
    cache_read_tokens: usage.cacheRead,
    cost_usd: usage.cost,
    ms,
    outcome,
  });
  return { ...reply, usage };
}
