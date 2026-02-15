import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client-side Supabase client for auth
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

export interface AdminCredentials {
  email: string;
  password: string;
}

export async function signInAdmin({ email, password }: AdminCredentials) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutAdmin() {
  const { error } = await supabaseAuth.auth.signOut();
  if (error) throw error;
}

export async function getCurrentAdmin() {
  const {
    data: { session },
    error,
  } = await supabaseAuth.auth.getSession();

  if (error) throw error;
  return session?.user ?? null;
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabaseAuth.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
