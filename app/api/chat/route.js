import Anthropic from "@anthropic-ai/sdk";
import { after } from "next/server";
import assistant from "@/content/assistant";
import { localAnswer } from "@/lib/localBrain";
import { PAGES, REPLY_TOOL, systemPrompt } from "@/lib/assistantPrompt";
import { clientIp, json, readJson } from "@/lib/http";
import { lagosTime } from "@/lib/lagos";
import { chatLimit } from "@/lib/rateLimit";
import { keepChatTurn, keepMessage } from "@/lib/store";
import { isEmail, LIMITS } from "@/lib/validate";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 400;
const MAX_MESSAGES = 12;
const MAX_CHARS = 600;
const MAX_BODY = 32 * 1024;

const PRICE = { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 };

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 20_000, maxRetries: 1 });
  return client;
}

const contacted = new Set();

function validate(data) {
  if (!data || typeof data !== "object") return null;
  const { sessionId, messages } = data;
  if (typeof sessionId !== "string" || !/^[A-Za-z0-9_-]{8,64}$/.test(sessionId)) return null;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) return null;
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return null;
    if (typeof m.content !== "string" || !m.content.trim() || m.content.length >= MAX_CHARS) return null;
  }
  if (messages[messages.length - 1].role !== "user") return null;
  return { sessionId, messages: messages.map((m) => ({ role: m.role, content: m.content.trim() })) };
}

function forModel(messages) {
  const out = [];
  for (const m of messages) {
    if (!out.length && m.role !== "user") continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content;
    else out.push({ ...m });
  }
  return out;
}

function tidy(text) {
  return String(text)
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, "")
    .replace(/^#+\s*/gm, "")
    .replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1 to $2")
    .replace(/\s+[\u2013\u2014]\s+/g, ", ")
    .replace(/[\u2013\u2014]/g, ", ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 1500);
}

function logUsage(usage, stop) {
  const u = {
    input: usage.input_tokens || 0,
    output: usage.output_tokens || 0,
    cacheWrite: usage.cache_creation_input_tokens || 0,
    cacheRead: usage.cache_read_input_tokens || 0,
  };
  const cost = (u.input * PRICE.input + u.output * PRICE.output + u.cacheWrite * PRICE.cacheWrite + u.cacheRead * PRICE.cacheRead) / 1e6;
  console.log(
    `[chat] tokens in ${u.input}, out ${u.output}, cache write ${u.cacheWrite}, cache read ${u.cacheRead}, stop ${stop}, about $${cost.toFixed(5)}`
  );
}

async function askModel(api, messages) {
  const res = await api.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.3,
    system: [
      { type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } },
      { type: "text", text: `The time in Lagos now is ${lagosTime()}.` },
    ],
    tools: [REPLY_TOOL],
    tool_choice: { type: "tool", name: REPLY_TOOL.name },
    messages: forModel(messages),
  });
  logUsage(res.usage, res.stop_reason);
  if (res.stop_reason === "refusal") throw new Error("the model declined to answer");
  if (res.stop_reason === "max_tokens") throw new Error("the answer ran past the token limit");
  const call = res.content.find((b) => b.type === "tool_use" && b.name === REPLY_TOOL.name);
  const input = call && call.input;
  if (!input || typeof input.text !== "string" || !input.text.trim()) throw new Error("the model sent no answer");
  const page = PAGES.find((p) => p.href === input.link);
  const c = input.contact;
  const person =
    c && typeof c.name === "string" && c.name.trim() && isEmail(c.email)
      ? { name: c.name.trim().slice(0, LIMITS.name), email: c.email.trim(), note: String(c.note || "").trim().slice(0, 500) }
      : null;
  return { text: tidy(input.text), link: page ? { label: page.label, href: page.href } : null, whatsapp: input.whatsapp === true, person };
}

export async function POST(request) {
  const limit = chatLimit(clientIp(request));
  if (!limit.ok) {
    return json({ reply: assistant.busy, link: null, whatsapp: true, source: "limit" }, 429, { "Retry-After": String(limit.retryAfter) });
  }
  const body = await readJson(request, MAX_BODY);
  if (body.error) return json({ error: body.error }, body.error === "too_large" ? 413 : 400);
  const input = validate(body.data);
  if (!input) return json({ error: "invalid" }, 400);

  const question = input.messages[input.messages.length - 1].content;
  let answer = null;
  let source = "local";
  const api = getClient();
  if (api) {
    try {
      answer = await askModel(api, input.messages);
      source = "model";
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) console.error("[chat] The Anthropic key was refused. Check ANTHROPIC_API_KEY.");
      else if (error instanceof Anthropic.RateLimitError) console.error("[chat] Anthropic rate limit reached.");
      else if (error instanceof Anthropic.APIConnectionError) console.error("[chat] Could not reach Anthropic:", error.message);
      else if (error instanceof Anthropic.APIError) console.error(`[chat] Anthropic error ${error.status}:`, error.message);
      else console.error("[chat]", error.message);
      console.error("[chat] Answered from the local brain instead.");
    }
  }
  if (!answer) {
    const local = localAnswer(question);
    answer = { text: local.text, link: local.link, whatsapp: local.whatsapp, person: null };
  }

  const { sessionId } = input;
  const person = answer.person && !contacted.has(sessionId) ? answer.person : null;
  if (person) contacted.add(sessionId);
  after(async () => {
    await keepChatTurn(sessionId, [
      { role: "user", content: question },
      { role: "assistant", content: answer.text },
    ]);
    if (person) {
      await keepMessage({
        name: person.name,
        email: person.email,
        need: "other",
        channel: null,
        rows: null,
        product: null,
        message: person.note || "Asked the site assistant for someone to get in touch.",
        source: "assistant",
      });
    }
  });

  return json({ reply: answer.text, link: answer.link, whatsapp: answer.whatsapp, source });
}
