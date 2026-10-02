import "server-only";
import { createClient } from "@supabase/supabase-js";

// The database client, with the service key. Server only: nothing from it reaches the browser.
// Returns null until SUPABASE_URL and SUPABASE_SERVICE_KEY are set.
let client = null;

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
