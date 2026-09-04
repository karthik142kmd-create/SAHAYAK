import { createClient } from "@supabase/supabase-js";

// Publishable (public) key — safe for browser use, read-only under RLS.
export const SUPABASE_URL = "https://gvcoyitpbgjrxpadyzij.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__nrco4vYnE9HVf6sfesb0w_mvZ1Mwd0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});
