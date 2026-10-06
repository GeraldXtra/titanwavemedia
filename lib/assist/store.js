import "server-only";
import { getAdmin } from "../supabase";
import { siteUrl } from "../seo";

// Reading assistants for the chat, with a short memory so a busy website does not ask the
// database on every page load. Changes a business saves reach its website within a minute.

const TTL = 60 * 1000;
const MAX_KEPT = 2000;
const cache = new Map();

const PUBLIC_ID = /^[a-z0-9]{8,32}$/;

// The assistants row for a public id, or null when there is none. Kept for 60 seconds on this
// server. { fresh: true } always reads the database (the console's test chat uses it, so a
// change shows at once). Throws when the database cannot be read.
export async function loadAssistant(publicId, { fresh = false } = {}) {
  if (typeof publicId !== "string" || !PUBLIC_ID.test(publicId)) return null;
  const now = Date.now();
  const hit = cache.get(publicId);
  if (!fresh && hit && now - hit.at < TTL) return hit.row;
  const admin = getAdmin();
  if (!admin) return null;
  const { data, error } = await admin.from("assistants").select("*").eq("public_id", publicId).maybeSingle();
  if (error) throw new Error(`assist store: ${error.message}`);
  if (cache.size >= MAX_KEPT) {
    for (const [k, v] of cache) if (now - v.at >= TTL) cache.delete(k);
    if (cache.size >= MAX_KEPT) cache.clear();
  }
  cache.set(publicId, { at: now, row: data || null });
  return data || null;
}

// Forgets the kept copy on this server, after a change is saved. Other servers catch up
// within a minute.
export function forgetAssistant(publicId) {
  cache.delete(publicId);
}

// The business's assistant, made with the business's name the first time it is asked for.
export async function ensureAssistant(businessId) {
  const admin = getAdmin();
  const found = await admin.from("assistants").select("*").eq("business_id", businessId).maybeSingle();
  if (found.error) throw new Error(`assist store: ${found.error.message}`);
  if (found.data) return found.data;
  const { data: business, error } = await admin.from("businesses").select("id, name").eq("id", businessId).maybeSingle();
  if (error) throw new Error(`assist store: ${error.message}`);
  if (!business) return null;
  const made = await admin
    .from("assistants")
    .upsert({ business_id: businessId, name: String(business.name || "").trim().slice(0, 120) }, { onConflict: "business_id", ignoreDuplicates: true })
    .select("*");
  if (made.error) throw new Error(`assist store: ${made.error.message}`);
  if (made.data && made.data[0]) return made.data[0];
  // Someone else made it at the same moment.
  const again = await admin.from("assistants").select("*").eq("business_id", businessId).maybeSingle();
  if (again.error) throw new Error(`assist store: ${again.error.message}`);
  return again.data;
}

// What the chat page may know about an assistant: nothing it is taught, only how the chat looks
// and how a customer reaches a person.
export function publicSettings(a) {
  return {
    name: a.name || "",
    greeting: a.greeting || "",
    starters: Array.isArray(a.starters) ? a.starters.filter((s) => typeof s === "string" && s.trim()).slice(0, 4) : [],
    color: a.color,
    textColor: a.text_color,
    corner: a.corner === "left" ? "left" : "right",
    whatsapp: a.whatsapp || "",
    phone: a.phone || "",
    email: a.email || "",
    sites: Array.isArray(a.sites) ? a.sites : [],
  };
}

// The one line a business adds to its website.
export function installCode(publicId) {
  return `<script src="${siteUrl}/assist.js" data-id="${publicId}" async></script>`;
}

// Lagos is one hour ahead of UTC all year.
const LAGOS = 60 * 60 * 1000;

// The start of today in Lagos, as an ISO time.
export function dayStart(now = new Date()) {
  const d = new Date(now.getTime() + LAGOS);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - LAGOS).toISOString();
}

// The start of this calendar month in Lagos, as an ISO time.
export function monthStart(now = new Date()) {
  const d = new Date(now.getTime() + LAGOS);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - LAGOS).toISOString();
}
