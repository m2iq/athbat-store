import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL — add it to admin/.env.local",
  );
}

const key = supabaseServiceKey || supabaseAnonKey;

if (!key) {
  throw new Error(
    "❌ Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY — add at least one to admin/.env.local",
  );
}

if (!supabaseServiceKey) {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY not set — using anon key.\n" +
      "   Write operations will fail due to RLS.\n" +
      "   Add SUPABASE_SERVICE_ROLE_KEY=your_key to admin/.env.local",
  );
}

export const supabase = createClient(supabaseUrl, key);
