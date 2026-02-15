import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL\n" +
    "   Add it to Vercel Environment Variables or admin/.env.local"
  );
}

const key = supabaseServiceKey || supabaseAnonKey;

if (!key) {
  console.error(
    "❌ Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY\n" +
    "   Add at least one to Vercel Environment Variables or admin/.env.local"
  );
}

if (!supabaseServiceKey) {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY not set — using anon key.\n" +
      "   Write operations will fail due to RLS.\n" +
      "   Add SUPABASE_SERVICE_ROLE_KEY to Vercel Environment Variables",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  key || "placeholder-key"
);
