import { createClient } from "@supabase/supabase-js";

/** Server-side admin client when needed for future storage/features */
export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}
