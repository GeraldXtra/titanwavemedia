import "server-only";
import { getAdmin } from "./supabase";
import { ownerEmail } from "./accounts";
import { naira } from "./format";
import { format } from "./text";
import events from "@/content/console/events";

// Recent activity and the bell. Events are kept as a short name plus details; the words come
// from content/console/events.js when they are shown.

// The details, ready to fill in: kobo becomes naira, a step number gets its name.
export function eventValues(data = {}) {
  const v = { ...data };
  if (data.amount_kobo != null) v.amount = naira(data.amount_kobo);
  if (data.step) {
    v.n = data.step;
    v.step = events.steps[data.step - 1] || "";
  }
  return v;
}

export function eventText(group, kind, data) {
  const words = events[group] && events[group][kind];
  return words ? format(words, eventValues(data)) : "";
}

export async function addActivity(businessId, userId, kind, data = {}) {
  if (!businessId) return;
  const { error } = await getAdmin().from("activity").insert({ business_id: businessId, user_id: userId || null, kind, data });
  if (error) console.error("[events] activity:", error.message);
}

async function insertNotes(userIds, audience, kind, data, link) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return;
  const { error } = await getAdmin()
    .from("notifications")
    .insert(ids.map((user_id) => ({ user_id, audience, kind, data, link })));
  if (error) console.error("[events] notify:", error.message);
}

// Everyone who has joined a business (or only its owners), except `except` (the person who
// did the thing, who does not need telling).
// Each comes with their name and email settings.
export async function businessPeople(businessId, { ownersOnly = false } = {}) {
  const admin = getAdmin();
  let q = admin.from("business_members").select("user_id, email, role").eq("business_id", businessId).not("joined_at", "is", null);
  if (ownersOnly) q = q.eq("role", "owner");
  const { data } = await q;
  const people = (data || []).filter((m) => m.user_id);
  if (!people.length) return [];
  const { data: profiles } = await admin.from("profiles").select("user_id, full_name, notify_projects, notify_billing, notify_news").in("user_id", people.map((p) => p.user_id));
  const byId = new Map((profiles || []).map((p) => [p.user_id, p]));
  return people.map((p) => ({ ...p, profile: byId.get(p.user_id) || {} }));
}

export async function notifyBusiness(businessId, kind, data, link, { ownersOnly = false, except = null } = {}) {
  if (!businessId) return;
  const people = await businessPeople(businessId, { ownersOnly });
  await insertNotes(people.map((p) => p.user_id).filter((id) => id !== except), "client", kind, data, link);
}

// The owner and every team member who has signed in.
export async function teamUserIds() {
  const admin = getAdmin();
  const [{ data: team }, { data: owner }] = await Promise.all([
    admin.from("team_members").select("user_id").not("user_id", "is", null),
    ownerEmail() ? admin.from("profiles").select("user_id").eq("email", ownerEmail()) : Promise.resolve({ data: [] }),
  ]);
  return [...(team || []), ...(owner || [])].map((r) => r.user_id);
}

export async function notifyTeam(kind, data, link, { except = null } = {}) {
  const ids = await teamUserIds();
  await insertNotes(ids.filter((id) => id !== except), "team", kind, data, link);
}
