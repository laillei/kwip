// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Uses service role key — NEVER import this in client components.
 * Only use in server components, API routes, and scripts.
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
