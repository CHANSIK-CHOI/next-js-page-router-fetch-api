import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

// Supabase에서 “프로젝트에 접속할 수 있는 클라이언트 객체
// createClient는 Supabase API에 연결하기 위한 접속 핸들(클라이언트 인스턴스) 를 만드는 역할
export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}
