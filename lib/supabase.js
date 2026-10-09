import "server-only";
import { createClient } from "@supabase/supabase-js";
import { setting, supabaseUrl } from "./settings.mjs";

let client = null;

export function getSupabase() {
  const url = supabaseUrl();
  const key = setting("SUPABASE_SERVICE_KEY");
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}

export const getAdmin = getSupabase;
