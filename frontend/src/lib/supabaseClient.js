// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables are missing");
  console.error("VITE_SUPABASE_URL:", supabaseUrl);
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Present" : "Missing");
  throw new Error("Supabase env vars not configured");
}

// Dynamic redirect URL
const getRedirectUrl = () => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/auth/callback`;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      "X-Client-Info": "manhwa-ai-frontend",
    },
  },
});

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('🔗 Auth Redirect URL:', getRedirectUrl());
  console.log('🔧 Supabase URL:', supabaseUrl);
}