import "server-only";
import { createClient } from "@supabase/supabase-js";

// The database client, with the service key. Server only: nothing from it reaches the browser.
// It skips row level security, so every use must first check who is asking.
// Returns null until SUPABASE_SERVICE_KEY and the project address are set.
let client = null;

export function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}

// The same client, under the name the console code uses.
export const getAdmin = getSupabase;
