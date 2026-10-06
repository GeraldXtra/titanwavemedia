import "server-only";
import { lagosParts, lagosToday } from "../format";
import { clock12 } from "../lagos";
import { likeExact } from "../text";
import { questionKey } from "./privacy";
import { monthStart } from "./store";

// What the console's Wave Assist pages read: the numbers at the top, the conversations, the
// handovers waiting, and the questions it couldn't answer. `db` is the signed in person's own
// client for a business's pages (row level security keeps them to their business), or the
// service client for Team view. Every read also names the business, so both read the same rows.
// Test chats are never kept, so nothing here counts them.

const DAY = 24 * 60 * 60 * 1000;
const PAGE = 1000;

// Every row a query gives, a page at a time, up to `max` rows. `make` returns a fresh query.
export async function allRows(make, max = 10000) {
  const out = [];
  for (let from = 0; from < max; from += PAGE) {
    const { data, error } = await make().range(from, Math.min(from + PAGE, max) - 1);
    if (error) throw new Error(`assist console: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

async function counted(query) {
  const { count, error } = await query;
  if (error) throw new Error(`assist console: ${error.message}`);
  return count || 0;
}

// The 3 hours, in Lagos time, in which most of these moments fall: { from: "7 pm", to: "10 pm" },
// or null when there are none. A window can run past midnight. Between two windows with as
// many, the one that starts with a busy hour wins, so it starts when things pick up.
export function busiestWindow(times) {
  if (!times.length) return null;
  const hours = new Array(24).fill(0);
  for (const t of times) hours[lagosParts(t).hour]++;
  let best = 0;
  let most = -1;
  for (let h = 0; h < 24; h++) {
    const n = (hours[h] + hours[(h + 1) % 24] + hours[(h + 2) % 24]) * 2 + (hours[h] > 0 ? 1 : 0);
    if (n > most) {
      most = n;
      best = h;
    }
  }
  return { from: clock12(best), to: clock12((best + 3) % 24) };
}

// The numbers at the top of Wave Assist, from real conversations only:
// - total, handed: conversations started in the last 30 days, and how many went to a person;
// - answered of under: of those that started under the monthly limit, how many it answered
//   without help (a conversation over the limit is only ever offered a person);
// - busiest: the busiest 3 hours, by when those conversations started, in Lagos time;
// - month: this Lagos calendar month's conversations against the limit, and how many came after;
// - days: conversations started on each of the last 14 Lagos days, oldest first.
export async function assistStats(db, assistant, now = new Date()) {
  const businessId = assistant.business_id;
  const since = new Date(now.getTime() - 30 * DAY).toISOString();
  const month = monthStart(now);
  const head = () => db.from("assist_conversations").select("id", { count: "exact", head: true }).eq("business_id", businessId);
  const [total, under, answered, handed, used, over, starts] = await Promise.all([
    counted(head().gte("created_at", since)),
    counted(head().gte("created_at", since).eq("over_limit", false)),
    counted(head().gte("created_at", since).eq("over_limit", false).eq("outcome", "answered")),
    counted(head().gte("created_at", since).eq("outcome", "handed_over")),
    counted(head().gte("created_at", month).eq("over_limit", false)),
    counted(head().gte("created_at", month).eq("over_limit", true)),
    allRows(() => db.from("assist_conversations").select("created_at").eq("business_id", businessId).gte("created_at", since).order("created_at", { ascending: false })),
  ]);

  const days = [];
  for (let i = 13; i >= 0; i--) days.push({ day: lagosToday(-i, now), count: 0 });
  const byDay = new Map(days.map((d) => [d.day, d]));
  for (const s of starts) {
    const d = byDay.get(lagosToday(0, new Date(s.created_at)));
    if (d) d.count++;
  }

  return {
    total,
    under,
    answered,
    percent: under ? Math.round((answered / under) * 100) : null,
    handed,
    busiest: busiestWindow(starts.map((s) => new Date(s.created_at))),
    month: { used, over, limit: assistant.monthly_limit },
    days,
  };
}

// The conversation filters, and the outcome each one shows.
export const FILTERS = { answered: "answered", handed: "handed_over", unanswered: "unanswered" };
export const PER_PAGE = 25;

// One page of conversations, the most recent first. `q` finds conversations with a message that
// has those words in it. Returns { rows, count, page, pages }.
export async function listConversations(db, businessId, { q = "", filter = "", page = 1 } = {}) {
  const term = String(q).replace(/\*/g, " ").trim().slice(0, 100);
  let query = db
    .from("assist_conversations")
    .select(`id, created_at, last_message_at, message_count, outcome, first_message, over_limit${term ? ", assist_messages!inner(id)" : ""}`, { count: "exact" })
    .eq("business_id", businessId);
  if (term) query = query.ilike("assist_messages.body", `%${likeExact(term)}%`);
  if (FILTERS[filter]) query = query.eq("outcome", FILTERS[filter]);
  const from = (Math.max(1, page) - 1) * PER_PAGE;
  const { data, count, error } = await query.order("last_message_at", { ascending: false }).range(from, from + PER_PAGE - 1);
  // Asking for a page past the end is an error from the database; it is simply empty.
  if (error && error.code !== "PGRST103") throw new Error(`assist console: ${error.message}`);
  const total = count || 0;
  return {
    rows: (data || []).map(({ assist_messages, ...c }) => c),
    count: total,
    page: Math.max(1, page),
    pages: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

// The details customers left that nobody has marked as handled yet, newest first.
export async function waitingHandovers(db, businessId) {
  const { data, error } = await db
    .from("assist_handovers")
    .select("id, created_at, conversation_id, name, phone, email, question")
    .eq("business_id", businessId)
    .is("handled_at", null)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`assist console: ${error.message}`);
  return data || [];
}

// The questions it couldn't answer that have no answer yet, the same question once: most asked
// first, then the most recent. Each is { key, text, count, last }, where text is the newest
// way it was asked.
export async function openQuestions(db, businessId, max = 100) {
  const rows = await allRows(
    () =>
      db
        .from("assist_messages")
        .select("question_key, body, created_at")
        .eq("business_id", businessId)
        .eq("role", "customer")
        .eq("answered", false)
        .is("resolved_at", null)
        .order("created_at", { ascending: false }),
    5000
  );
  const groups = new Map();
  for (const r of rows) {
    const key = r.question_key || questionKey(r.body);
    if (!key) continue;
    const g = groups.get(key);
    if (g) g.count++;
    else groups.set(key, { key, text: r.body, count: 1, last: r.created_at });
  }
  const all = [...groups.values()].sort((a, b) => b.count - a.count || Date.parse(b.last) - Date.parse(a.last));
  return { list: all.slice(0, max), total: all.length };
}

// One conversation of the business, with its messages and any details the customer left, or null.
export async function loadConversationView(db, businessId, id) {
  const { data: conversation, error } = await db
    .from("assist_conversations")
    .select("id, created_at, last_message_at, message_count, outcome, first_message, over_limit, ended_at, whatsapp_at")
    .eq("id", id)
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw new Error(`assist console: ${error.message}`);
  if (!conversation) return null;
  const [messages, handovers] = await Promise.all([
    db.from("assist_messages").select("id, created_at, role, body, answered, handover, source").eq("conversation_id", id).eq("business_id", businessId).order("id"),
    db.from("assist_handovers").select("id, created_at, name, phone, email, question, handled_at").eq("conversation_id", id).eq("business_id", businessId).order("created_at"),
  ]);
  if (messages.error) throw new Error(`assist console: ${messages.error.message}`);
  if (handovers.error) throw new Error(`assist console: ${handovers.error.message}`);
  return { conversation, messages: messages.data || [], handovers: handovers.data || [] };
}
