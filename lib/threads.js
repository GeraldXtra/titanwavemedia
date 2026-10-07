import "server-only";
import { getAdmin } from "./supabase";
import { lagosClock, lagosShort, lagosToday } from "./format";
import { workingStatus, clock12 } from "./lagos";
import { format } from "./text";
import site from "@/content/site";
import support from "@/content/support";

const TEAM_NAME = "Titan Wave Media";

export function when(iso) {
  const d = new Date(iso);
  return lagosToday(0, d) === lagosToday() ? lagosClock(d) : `${lagosShort(iso)}, ${lagosClock(d)}`;
}

export async function loadMessages(threadId) {
  const { data } = await getAdmin()
    .from("thread_messages")
    .select("id, created_at, from_team, author_id, author_name, body")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(500);
  return data || [];
}

export function shapeMessages(rows, { viewer, userId, you, teamSuffix = TEAM_NAME }) {
  return rows.map((m) => {
    const mine = viewer === "team" ? m.from_team : !m.from_team;
    let who;
    if (m.author_id === userId) who = you;
    else if (viewer === "client") who = m.from_team ? `${(m.author_name || "").split(/\s+/)[0] || teamSuffix}, ${teamSuffix}` : m.author_name || "";
    else who = m.from_team ? m.author_name || teamSuffix : m.author_name || "";
    return { id: m.id, body: m.body, mine, who, at: when(m.created_at) };
  });
}

export async function addMessage(thread, { fromTeam, userId, name, body }) {
  const admin = getAdmin();
  const now = new Date().toISOString();
  const { error } = await admin.from("thread_messages").insert({ thread_id: thread.id, from_team: fromTeam, author_id: userId, author_name: name, body });
  if (error) throw new Error(`threads: ${error.message}`);
  let status = thread.status;
  if (!fromTeam) status = "new";
  else if (thread.kind === "help") status = thread.status === "solved" ? "solved" : "waiting";
  else status = "replied";
  await admin.from("threads").update({ status, last_message_at: now, last_from: fromTeam ? "team" : "client", updated_at: now }).eq("id", thread.id);
  return status;
}

export function onlineLine(words) {
  const s = workingStatus(site.hours);
  if (s.open) return { on: true, text: words.online };
  const h = support.hero;
  const time = clock12(s.hour);
  const next = s.inDays === 0 ? format(h.nextToday, { time }) : s.inDays === 1 ? format(h.nextTomorrow, { time }) : format(h.nextLater, { time, day: h.days[s.day] });
  return { on: false, text: format(words.away, { next }) };
}
