import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Both clients are created lazily so that importing this module never calls
// createClient() at module-evaluation time. During Next.js build (page-data
// collection) the public env vars are not present, and createClient() throws
// on empty/undefined URLs — lazy init avoids that entirely.

let _public: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_public) return _public;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase client is not configured (missing URL or anon key).");
  }
  _public = createClient(url, anon);
  return _public;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin client is not configured (missing URL or service role key).");
  }
  _admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

