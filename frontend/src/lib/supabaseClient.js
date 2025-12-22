import { createClient } from "@supabase/supabase-js";

/**
 * Environment variables (Vite requires VITE_ prefix)
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Hard safety check (fails loudly in dev)
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables are missing");
  console.error("VITE_SUPABASE_URL:", supabaseUrl);
  console.error(
    "VITE_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "Present" : "Missing"
  );
  throw new Error("Supabase env vars not configured");
}

/**
 * Single Supabase client for the entire frontend
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,

    /**
     * IMPORTANT
     * Required for OAuth redirects (/auth/callback)
     */
    detectSessionInUrl: true,
  },

  /**
   * Optional but recommended
   * Prevents random auth issues on flaky networks
   */
  global: {
    headers: {
      "X-Client-Info": "manhwa-ai-frontend",
    },
  },
});
