import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient(authHeader?: string) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });
}
