import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;

// IMPORTANT: this must be the service_role key, not the anon/public key.
// The users/favorites tables have Row Level Security enabled with no
// policies, so the anon key can't read or write anything — only the
// service_role key (kept server-side only, never shipped to the
// frontend) can bypass RLS. Find it in Supabase: Project Settings ->
// API -> Project API keys -> service_role (click "Reveal").
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Supabase URL or service role key missing in env. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Backend/.env."
  );
  throw new Error(
    "Supabase URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
