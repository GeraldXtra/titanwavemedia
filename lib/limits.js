import "server-only";
import { getAdmin } from "./supabase";
import { keyHash } from "./security";

export const LIMITS = {
  linkEmail: { limit: 5, windowMs: 60 * 60 * 1000 },
  linkNetwork: { limit: 20, windowMs: 60 * 60 * 1000 },
  code: { limit: 10, windowMs: 15 * 60 * 1000 },
  assistVisitor: { limit: 30, windowMs: 60 * 60 * 1000 },
  assistHandover: { limit: 5, windowMs: 60 * 60 * 1000 },
};

async function recent(bucket, key, windowMs) {
  const db = getAdmin();
  const since = new Date(Date.now() - windowMs).toISOString();
  const { data, error } = await db
    .from("rate_hits")
    .select("created_at")
    .eq("bucket", bucket)
    .eq("key", keyHash(`${bucket}:${key}`))
    .gte("created_at", since)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`limits: ${error.message}`);
  return data;
}

export async function check(bucket, key) {
  const { limit, windowMs } = LIMITS[bucket];
  const rows = await recent(bucket, key, windowMs);
  if (rows.length < limit) return { ok: true };
  const oldest = new Date(rows[0].created_at).getTime();
  return { ok: false, retryAfter: Math.max(1, Math.ceil((oldest + windowMs - Date.now()) / 1000)) };
}

export async function hit(bucket, key) {
  const { error } = await getAdmin().from("rate_hits").insert({ bucket, key: keyHash(`${bucket}:${key}`) });
  if (error) throw new Error(`limits: ${error.message}`);
}

export async function clear(bucket, key) {
  await getAdmin().from("rate_hits").delete().eq("bucket", bucket).eq("key", keyHash(`${bucket}:${key}`));
}
