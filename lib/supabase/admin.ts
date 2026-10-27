import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/env";

/**
 * Supabase client with the SECRET key. It bypasses row level security,
 * so it is only used on the server, for saving client submissions.
 * The "server-only" import makes the build fail if this file ever reaches the browser.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing environment variable SUPABASE_SECRET_KEY. See .env.example.");
  }

  return createClient(supabaseUrl(), secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
